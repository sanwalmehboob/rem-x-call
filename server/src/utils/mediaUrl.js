const config = require('../config/config');

/**
 * Returns the absolute URL for a media file.
 * Automatically appends the correct port if the Host header is missing it (e.g. when behind some reverse proxies).
 * 
 * @param {Object} req - Express request object
 * @param {string} filePath - Relative file path or absolute URL
 * @returns {string|null} - Absolute URL
 */
const getMediaUrl = (req, filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const protocol = req && req.protocol ? req.protocol : 'http';
    const host = req && typeof req.get === 'function' ? (req.get('host') || 'localhost') : 'localhost';
    const port = config.get('port');
    
    let finalHost = host;
    // If Host header has no port, append the configured app port (unless it is default HTTP/S ports)
    if (!host.includes(':') && port && port !== 80 && port !== 443) {
        finalHost = `${host}:${port}`;
    }
    
    return `${protocol}://${finalHost}${normalizedPath}`;
};

module.exports = {
    getMediaUrl,
};
