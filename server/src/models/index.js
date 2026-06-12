const Sequelize = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

const dbConfig = config.get('db');

const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize);
db.RevokedToken = require('./RevokedToken')(sequelize);
db.UserSession = require('./UserSession')(sequelize);
db.Contact = require('./Contact')(sequelize);
db.CallLog = require('./CallLog')(sequelize);
db.SubscriptionPlan = require('./SubscriptionPlan')(sequelize);
db.Company = require('./Company')(sequelize);
db.Message = require('./Message')(sequelize);
db.PasswordResetOtp = require('./PasswordResetOtp')(sequelize);
db.Product = require('./Product')(sequelize);
db.SubscriptionHistory = require('./SubscriptionHistory')(sequelize);
db.ContactFraudFlag = require('./ContactFraudFlag')(sequelize);
db.ContactDispute = require('./ContactDispute')(sequelize);
db.FcmToken = require('./FcmToken')(sequelize);
db.Notification = require('./Notification')(sequelize);

db.Contact.belongsTo(db.User, {
    as: 'assignedAgent',
    foreignKey: 'assignedAgentId',
});
db.User.hasMany(db.Contact, {
    as: 'assignedContacts',
    foreignKey: 'assignedAgentId',
});

db.CallLog.belongsTo(db.Contact, {
    as: 'contact',
    foreignKey: 'contactId',
});
db.Contact.hasMany(db.CallLog, {
    as: 'callLogs',
    foreignKey: 'contactId',
});

db.SubscriptionPlan.hasMany(db.Company, {
    as: 'companies',
    foreignKey: 'subscriptionPlanId',
});
db.Company.belongsTo(db.SubscriptionPlan, {
    as: 'subscriptionPlan',
    foreignKey: 'subscriptionPlanId',
});

db.Company.hasMany(db.User, {
    as: 'members',
    foreignKey: 'companyId',
});
db.User.belongsTo(db.Company, {
    as: 'company',
    foreignKey: 'companyId',
});

db.User.hasMany(db.UserSession, {
    as: 'sessions',
    foreignKey: 'userId',
});
db.UserSession.belongsTo(db.User, {
    as: 'user',
    foreignKey: 'userId',
});

db.Company.hasMany(db.Message, {
    as: 'messages',
    foreignKey: 'companyId',
});
db.Message.belongsTo(db.Company, {
    as: 'company',
    foreignKey: 'companyId',
});

db.Message.belongsTo(db.User, {
    as: 'sender',
    foreignKey: 'senderUserId',
});
db.User.hasMany(db.Message, {
    as: 'sentMessages',
    foreignKey: 'senderUserId',
});

db.Product.belongsTo(db.User, {
    as: 'user',
    foreignKey: 'userId',
});
db.User.hasMany(db.Product, {
    as: 'products',
    foreignKey: 'userId',
});

// SubscriptionHistory associations
db.SubscriptionHistory.belongsTo(db.Company, {
    as: 'company',
    foreignKey: 'companyId',
});
db.Company.hasMany(db.SubscriptionHistory, {
    as: 'subscriptionHistories',
    foreignKey: 'companyId',
});

// ContactFraudFlag associations
db.ContactFraudFlag.belongsTo(db.Contact, {
    as: 'contact',
    foreignKey: 'contactId',
});
db.Contact.hasMany(db.ContactFraudFlag, {
    as: 'fraudFlags',
    foreignKey: 'contactId',
});

// ContactDispute associations
db.ContactDispute.belongsTo(db.Contact, {
    as: 'contact',
    foreignKey: 'contactId',
});
db.Contact.hasMany(db.ContactDispute, {
    as: 'disputes',
    foreignKey: 'contactId',
});

// FcmToken associations
db.FcmToken.belongsTo(db.User, {
    as: 'user',
    foreignKey: 'userId',
});
db.User.hasMany(db.FcmToken, {
    as: 'fcmTokens',
    foreignKey: 'userId',
});

// Notification associations
db.Notification.belongsTo(db.User, {
    as: 'user',
    foreignKey: 'userId',
});
db.User.hasMany(db.Notification, {
    as: 'notifications',
    foreignKey: 'userId',
});
db.Notification.belongsTo(db.Contact, {
    as: 'contact',
    foreignKey: 'contactId',
});
db.Contact.hasMany(db.Notification, {
    as: 'notifications',
    foreignKey: 'contactId',
});

module.exports = db;
