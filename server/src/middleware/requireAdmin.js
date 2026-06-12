const ApiError = require('../utils/ApiError');

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return next(new ApiError(403, 'Admin access required'));
    }
    return next();
};

module.exports = requireAdmin;
