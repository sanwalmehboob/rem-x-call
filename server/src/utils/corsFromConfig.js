const config = require('../config/config');

/**
 * Shared CORS rules for Express and Socket.IO so staging (IP + ports) stays consistent.
 */
function parseOriginList() {
    const raw = config.get('cors.origins');
    if (!raw || !String(raw).trim()) return [];
    return String(raw)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function expressCorsOptions() {
    const list = parseOriginList();
    if (list.length === 0) {
        return {
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            optionsSuccessStatus: 204,
        };
    }
    return {
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (list.includes(origin)) return cb(null, true);
            cb(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 204,
    };
}

/** Socket.IO expects cors.origin compatible with credentials when needed */
function socketIoCors() {
    const list = parseOriginList();
    if (list.length === 0) {
        return {
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'HEAD'],
        };
    }
    return {
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (list.includes(origin)) return cb(null, true);
            cb(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'HEAD'],
    };
}

module.exports = {
    expressCorsOptions,
    socketIoCors,
};
