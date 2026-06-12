const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class UserSession extends Model {}

    UserSession.init(
        {
            sid: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            refreshTokenHash: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            refreshTokenExpiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            clientType: {
                type: DataTypes.ENUM('web', 'mobile', 'unknown'),
                allowNull: false,
                defaultValue: 'unknown',
            },
            platform: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            appVersion: {
                type: DataTypes.STRING(32),
                allowNull: true,
            },
            deviceId: {
                type: DataTypes.STRING(128),
                allowNull: true,
            },
            deviceName: {
                type: DataTypes.STRING(128),
                allowNull: true,
            },
            ipAddress: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            userAgent: {
                type: DataTypes.STRING(512),
                allowNull: true,
            },
            lastSeenAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            revokedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            revokedReason: {
                type: DataTypes.STRING(191),
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'UserSession',
            tableName: 'UserSessions',
            timestamps: true,
        }
    );

    return UserSession;
};
