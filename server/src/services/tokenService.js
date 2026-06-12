const jwt = require('jsonwebtoken');
const { createHash, randomUUID } = require('crypto');
const config = require('../config/config');
const { Op } = require('sequelize');
const { RevokedToken, UserSession } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Generate token
 * @param {number} userId
 * @param {Object} [opts]
 * @param {string} [opts.expiresIn]
 * @param {string} [opts.secret]
 * @param {string} [opts.tokenType]
 * @param {string} [opts.sid]
 * @returns {string}
 */
const generateToken = (userId, opts = {}) => {
    const secret = opts.secret || config.get('jwt.secret');
    const expiresIn = opts.expiresIn || config.get('jwt.expiresIn');
    const payload = {
        sub: userId,
        jti: randomUUID(),
    };
    if (opts.tokenType) {
        payload.tokenType = opts.tokenType;
    }
    if (opts.sid) {
        payload.sid = opts.sid;
    }
    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Hash an opaque token for DB storage.
 * @param {string} token
 * @returns {string}
 */
const hashToken = (token) => createHash('sha256').update(String(token)).digest('hex');

/**
 * Decode a signed token and return expiry date.
 * @param {string} token
 * @returns {Date}
 */
const getTokenExpiryDate = (token) => {
    const payload = jwt.decode(token);
    if (!payload?.exp) {
        throw new ApiError(500, 'Token generation failed: missing exp claim');
    }
    return new Date(payload.exp * 1000);
};

/**
 * Build tokens for an existing session record.
 * @param {User} user
 * @param {UserSession} session
 * @returns {Promise<Object>}
 */
const generateTokensForSession = async (user, session) => {
    const accessToken = generateToken(user.id, {
        tokenType: 'access',
        sid: session.sid,
    });
    const refreshToken = generateToken(user.id, {
        tokenType: 'refresh',
        secret: config.get('jwt.refreshSecret'),
        expiresIn: config.get('jwt.refreshExpiresIn'),
        sid: session.sid,
    });

    session.refreshTokenHash = hashToken(refreshToken);
    session.refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);
    session.lastSeenAt = new Date();
    await session.save();

    return {
        access: {
            token: accessToken,
            expires: config.get('jwt.expiresIn'),
        },
        refresh: {
            token: refreshToken,
            expires: config.get('jwt.refreshExpiresIn'),
        },
    };
};

const normalizeClientType = (value, isMobileFlag) => {
    if (isMobileFlag === true) {
        return 'mobile';
    }
    const normalized = String(value || '')
        .trim()
        .toLowerCase();
    if (normalized === 'web' || normalized === 'mobile') {
        return normalized;
    }
    return 'unknown';
};

const optionalTrimmed = (value, maxLength) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) {
        return null;
    }
    return trimmed.slice(0, maxLength);
};

/**
 * Generate auth tokens and create a persisted login session.
 * @param {User} user
 * @param {Object} [sessionMeta]
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, sessionMeta = {}) => {
    const session = await UserSession.create({
        userId: user.id,
        clientType: normalizeClientType(sessionMeta.clientType, sessionMeta.isMobile),
        platform: optionalTrimmed(sessionMeta.platform, 64),
        appVersion: optionalTrimmed(sessionMeta.appVersion, 32),
        deviceId: optionalTrimmed(sessionMeta.deviceId, 128),
        deviceName: optionalTrimmed(sessionMeta.deviceName, 128),
        ipAddress: optionalTrimmed(sessionMeta.ipAddress, 64),
        userAgent: optionalTrimmed(sessionMeta.userAgent, 512),
        refreshTokenHash: randomUUID(), // overwritten right after token creation
        refreshTokenExpiresAt: new Date(),
    });

    const tokens = await generateTokensForSession(user, session);
    return {
        ...tokens,
        session: {
            sid: session.sid,
            clientType: session.clientType,
            platform: session.platform,
            appVersion: session.appVersion,
            deviceId: session.deviceId,
            lastSeenAt: session.lastSeenAt,
        },
    };
};

const verifyRefreshToken = (refreshToken) => {
    try {
        return jwt.verify(refreshToken, config.get('jwt.refreshSecret'));
    } catch (err) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }
};

const refreshAuth = async (refreshToken, sessionMeta = {}) => {
    if (!refreshToken) {
        throw new ApiError(400, 'refreshToken is required');
    }
    const payload = verifyRefreshToken(refreshToken);
    if (!payload?.sub || !payload?.jti || payload.tokenType !== 'refresh' || !payload.sid) {
        throw new ApiError(401, 'Invalid refresh token payload');
    }

    const session = await UserSession.findOne({
        where: {
            sid: payload.sid,
            userId: payload.sub,
            revokedAt: null,
            refreshTokenExpiresAt: { [Op.gt]: new Date() },
        },
    });
    if (!session) {
        throw new ApiError(401, 'Session not found or expired');
    }

    if (session.refreshTokenHash !== hashToken(refreshToken)) {
        await revokeSessionBySid(payload.sub, payload.sid, 'refresh token replay');
        throw new ApiError(401, 'Refresh token has been rotated');
    }

    const clientType = normalizeClientType(sessionMeta.clientType, sessionMeta.isMobile);
    if (clientType !== 'unknown') {
        session.clientType = clientType;
    }
    const platform = optionalTrimmed(sessionMeta.platform, 64);
    if (platform) {
        session.platform = platform;
    }
    const appVersion = optionalTrimmed(sessionMeta.appVersion, 32);
    if (appVersion) {
        session.appVersion = appVersion;
    }
    const deviceName = optionalTrimmed(sessionMeta.deviceName, 128);
    if (deviceName) {
        session.deviceName = deviceName;
    }
    const ipAddress = optionalTrimmed(sessionMeta.ipAddress, 64);
    if (ipAddress) {
        session.ipAddress = ipAddress;
    }
    const userAgent = optionalTrimmed(sessionMeta.userAgent, 512);
    if (userAgent) {
        session.userAgent = userAgent;
    }
    session.lastSeenAt = new Date();

    const user = { id: payload.sub };
    const tokens = await generateTokensForSession(user, session);
    return {
        ...tokens,
        session: {
            sid: session.sid,
            clientType: session.clientType,
            platform: session.platform,
            appVersion: session.appVersion,
            deviceId: session.deviceId,
            lastSeenAt: session.lastSeenAt,
        },
    };
};

const revokeSessionBySid = async (userId, sid, reason = 'session logout') => {
    if (!sid) {
        return 0;
    }
    const [count] = await UserSession.update(
        {
            revokedAt: new Date(),
            revokedReason: reason,
        },
        {
            where: {
                userId,
                sid,
                revokedAt: null,
            },
        }
    );
    return count;
};

const revokeAllSessionsForUser = async (userId, reason = 'logout all') => {
    const [count] = await UserSession.update(
        {
            revokedAt: new Date(),
            revokedReason: reason,
        },
        {
            where: {
                userId,
                revokedAt: null,
            },
        }
    );
    return count;
};

const listActiveSessionsForUser = async (userId) => {
    return UserSession.findAll({
        where: {
            userId,
            revokedAt: null,
            refreshTokenExpiresAt: { [Op.gt]: new Date() },
        },
        attributes: [
            'sid',
            'clientType',
            'platform',
            'appVersion',
            'deviceId',
            'deviceName',
            'ipAddress',
            'userAgent',
            'lastSeenAt',
            'createdAt',
        ],
        order: [['lastSeenAt', 'DESC']],
    });
};

const revokeTokenByPayload = async (payload) => {
    if (!payload?.jti || !payload?.exp) {
        throw new ApiError(400, 'Invalid token payload');
    }

    await RevokedToken.findOrCreate({
        where: { jti: payload.jti },
        defaults: {
            jti: payload.jti,
            expiresAt: new Date(payload.exp * 1000),
        },
    });
};

module.exports = {
    generateToken,
    generateAuthTokens,
    refreshAuth,
    revokeSessionBySid,
    revokeAllSessionsForUser,
    listActiveSessionsForUser,
    revokeTokenByPayload,
};
