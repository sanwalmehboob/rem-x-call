const http = require('http');

const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');
const { initializeSocket } = require('./realtime/socket');

const server = http.createServer(app);
initializeSocket(server);

const PORT = config.get('port');
server.listen(PORT, () => {
    logger.info(`REM-X-CALL Server environment: ${config.get('env')}`);
    logger.info(`REM-X-CALL Server is running on port ${PORT}`);
});
