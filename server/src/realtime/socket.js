const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const config = require('../config/config');
const logger = require('../utils/logger');
const { socketIoCors } = require('../utils/corsFromConfig');
const { User, RevokedToken } = require('../models');

let ioInstance = null;

const COMPANY_ROOM_PREFIX = 'company:';

const getCompanyRoom = (companyId) => `${COMPANY_ROOM_PREFIX}${companyId}`;

const resolveToken = (socket) => {
    const fromAuth = socket.handshake?.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.trim()) {
        return fromAuth.trim();
    }

    const authHeader = socket.handshake?.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return '';
};

const parseCompanyId = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};

const canAccessCompany = (socketUser, companyId) => {
    if (!socketUser) return false;
    if (socketUser.role === 'admin') {
        return true;
    }
    return socketUser.companyId === companyId;
};

const socketAuth = async (socket, next) => {
    try {
        const token = resolveToken(socket);
        if (!token) {
            return next(new Error('Unauthorized'));
        }

        const payload = jwt.verify(token, config.get('jwt.secret'));
        const userId = payload?.sub;
        const tokenId = payload?.jti;
        if (!userId || !tokenId) {
            return next(new Error('Unauthorized'));
        }

        const revoked = await RevokedToken.findOne({ where: { jti: tokenId } });
        if (revoked) {
            return next(new Error('Unauthorized'));
        }

        const user = await User.findByPk(userId);
        if (!user || !user.isActive) {
            return next(new Error('Unauthorized'));
        }

        socket.userId = user.id;
        socket.user = {
            id: user.id,
            role: user.role,
            companyId: user.companyId,
        };
        return next();
    } catch (error) {
        return next(new Error('Unauthorized'));
    }
};

const userSockets = new Map(); // userId -> Set of socketId

const initializeSocket = (server) => {
    ioInstance = new Server(server, {
        cors: socketIoCors(),
    });

    ioInstance.use((socket, next) => {
        socketAuth(socket, next);
    });

    ioInstance.on('connection', (socket) => {
        logger.info(`User connected: ${socket.id}`);
        const userId = socket.userId;

        if (userId) {
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            const socketSet = userSockets.get(userId);
            const wasOffline = socketSet.size === 0;
            socketSet.add(socket.id);

            if (wasOffline) {
                ioInstance.emit('users:online-status', { userId, online: true });
            }

            if (socket.user && socket.user.role === 'admin') {
                socket.join('admins');
            }

            // Send list of currently online user IDs to the newly connected user
            const onlineIds = Array.from(userSockets.entries())
                .filter(([_, set]) => set.size > 0)
                .map(([uid, _]) => uid);
            socket.emit('users:online-list', onlineIds);
        }

        socket.on('users:request-online', () => {
            const onlineIds = Array.from(userSockets.entries())
                .filter(([_, set]) => set.size > 0)
                .map(([uid, _]) => uid);
            socket.emit('users:online-list', onlineIds);
        });

        socket.on('messages:join', (payload = {}) => {
            const companyId = parseCompanyId(payload.companyId);
            if (!companyId || !canAccessCompany(socket.user, companyId)) {
                return;
            }

            const room = getCompanyRoom(companyId);
            socket.join(room);
            socket.emit('messages:joined', { companyId });
        });

        socket.on('messages:leave', (payload = {}) => {
            const companyId = parseCompanyId(payload.companyId);
            if (!companyId) {
                return;
            }

            const room = getCompanyRoom(companyId);
            socket.leave(room);
        });

        socket.on('typing:start', (payload = {}) => {
            const companyId = parseCompanyId(payload.companyId);
            if (!companyId || !canAccessCompany(socket.user, companyId)) {
                return;
            }
            const room = getCompanyRoom(companyId);
            socket.to(room).emit('messages:typing', {
                companyId,
                userId: socket.userId,
                typing: true,
            });
        });

        socket.on('typing:stop', (payload = {}) => {
            const companyId = parseCompanyId(payload.companyId);
            if (!companyId || !canAccessCompany(socket.user, companyId)) {
                return;
            }
            const room = getCompanyRoom(companyId);
            socket.to(room).emit('messages:typing', {
                companyId,
                userId: socket.userId,
                typing: false,
            });
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
            if (userId) {
                const socketSet = userSockets.get(userId);
                if (socketSet) {
                    socketSet.delete(socket.id);
                    if (socketSet.size === 0) {
                        userSockets.delete(userId);
                        ioInstance.emit('users:online-status', { userId, online: false });
                    }
                }
            }
        });
    });

    return ioInstance;
};

const emitToCompanyRoom = (companyId, eventName, payload) => {
    if (!ioInstance) return;
    ioInstance.to(getCompanyRoom(companyId)).emit(eventName, payload);
    ioInstance.to('admins').emit(eventName, payload);
};

module.exports = {
    initializeSocket,
    emitToCompanyRoom,
};
