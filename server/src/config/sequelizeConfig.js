const config = require('./config');

const build = () => ({
    username: config.get('db.user'),
    password: config.get('db.password'),
    database: config.get('db.name'),
    host: config.get('db.host'),
    port: config.get('db.port'),
    dialect: 'mysql',
    logging: false,
});

/**
 * Sequelize CLI expects `development`, `test`, and `production` keys.
 * Values come from the same environment variables; change DB_NAME etc. per environment as needed.
 */
module.exports = {
    development: build(),
    test: build(),
    production: build(),
};
