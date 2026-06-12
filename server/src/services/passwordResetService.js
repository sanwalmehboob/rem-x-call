const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User, PasswordResetOtp } = require('../models');
const ApiError = require('../utils/ApiError');
const { sendPasswordResetOtpEmail } = require('./emailService');
const tokenService = require('./tokenService');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const MAX_ATTEMPTS = 5;

const GENERIC_REQUEST_MESSAGE =
    'If an account exists for this email, a verification code has been sent.';

/**
 * @param {string} rawEmail
 * @returns {Promise<{ message: string }>}
 */
const requestPasswordResetOtp = async (rawEmail) => {
    const email = normalizeEmail(rawEmail);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, 'Invalid email address');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return { message: GENERIC_REQUEST_MESSAGE };
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 10);
    const minutes = config.get('passwordReset.otpExpiresMinutes');
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    await PasswordResetOtp.upsert({
        email,
        otpHash,
        expiresAt,
        attempts: 0,
    });

    await sendPasswordResetOtpEmail({ to: email, otp });

    return { message: GENERIC_REQUEST_MESSAGE };
};

/**
 * @param {string} rawEmail
 * @param {string} otpRaw
 * @returns {Promise<{ resetToken: string }>}
 */
const verifyPasswordResetOtp = async (rawEmail, otpRaw) => {
    const email = normalizeEmail(rawEmail);
    const otp = String(otpRaw || '')
        .replace(/\D/g, '')
        .slice(0, 6);

    if (!email || otp.length !== 6) {
        throw new ApiError(400, 'Invalid verification code.');
    }

    const row = await PasswordResetOtp.findOne({ where: { email } });
    if (!row || new Date() > new Date(row.expiresAt)) {
        throw new ApiError(400, 'Invalid or expired verification code.');
    }
    if (row.attempts >= MAX_ATTEMPTS) {
        throw new ApiError(429, 'Too many attempts. Request a new code.');
    }

    const ok = await bcrypt.compare(otp, row.otpHash);
    if (!ok) {
        row.attempts += 1;
        await row.save();
        throw new ApiError(400, 'Invalid verification code.');
    }

    await row.destroy();

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ApiError(400, 'Invalid verification code.');
    }

    const resetToken = jwt.sign(
        { sub: user.id, tokenType: 'password_reset' },
        config.get('jwt.secret'),
        { expiresIn: config.get('passwordReset.resetTokenExpiresIn') }
    );

    return { resetToken };
};

/**
 * @param {string} resetToken
 * @param {string} newPassword
 * @returns {Promise<{ message: string }>}
 */
const completePasswordReset = async (resetToken, newPassword) => {
    let payload;
    try {
        payload = jwt.verify(resetToken, config.get('jwt.secret'));
    } catch {
        throw new ApiError(400, 'Invalid or expired reset session. Please start again.');
    }

    if (payload.tokenType !== 'password_reset' || !payload.sub) {
        throw new ApiError(400, 'Invalid or expired reset session. Please start again.');
    }

    const pwd = String(newPassword || '');
    if (pwd.length < 8 || pwd.length > 100) {
        throw new ApiError(400, 'Password must be between 8 and 100 characters');
    }

    const user = await User.findByPk(payload.sub);
    if (!user) {
        throw new ApiError(400, 'Invalid or expired reset session. Please start again.');
    }

    user.password = pwd;
    await user.save();
    await tokenService.revokeAllSessionsForUser(user.id, 'password reset');

    return { message: 'Password updated successfully.' };
};

module.exports = {
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    completePasswordReset,
};
