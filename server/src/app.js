const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/config');
const logger = require('./utils/logger');
const { errorConverter, errorHandler } = require('./middleware/errorMiddleware');
const ApiError = require('./utils/ApiError');
const { expressCorsOptions } = require('./utils/corsFromConfig');
const routes = require('./routes');

const app = express();

app.use(cors(expressCorsOptions()));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use('/v1', routes);

app.get('/health', (req, res) => {
    logger.info('Health check triggered');
    res.status(200).json({
        status: 'success',
        message: 'REM-X-CALL Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

if (config.get('env') === 'development') {
    app.get('/test-error', (req, res, next) => {
        next(new ApiError(400, 'This is a test error from the backend architecture!'));
    });
}

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
