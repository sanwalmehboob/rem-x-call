const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Notification extends Model {}

    Notification.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            body: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isArchived: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            contactId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            senderAvatarUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Notification',
            tableName: 'Notifications',
            timestamps: true,
        }
    );

    return Notification;
};
