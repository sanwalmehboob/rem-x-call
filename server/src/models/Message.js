const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Message extends Model {}

    Message.init(
        {
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            senderUserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            attachmentUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            attachmentOriginalName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
                allowNull: false,
                defaultValue: 'sent',
            },
            sentAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'Message',
            tableName: 'Messages',
            timestamps: true,
        }
    );

    return Message;
};
