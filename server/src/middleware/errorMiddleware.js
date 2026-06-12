const logger = require('../utils/logger');
const config = require('../config/config');

const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof Error)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new Error(statusCode, message, false, err.stack);
    }
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (config.get('env') === 'production' && !err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error';
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode || 500,
        message,
        ...(config.get('env') === 'development' && { stack: err.stack }),
    };

    if (config.get('env') === 'development') {
        logger.error(err);
    }

    res.status(statusCode || 500).json(response);
};

module.exports = {
    errorConverter,
    errorHandler,
};
