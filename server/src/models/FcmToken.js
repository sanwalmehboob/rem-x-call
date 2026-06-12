const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class FcmToken extends Model {}

    FcmToken.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING(512),
                allowNull: false,
            },
            platform: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            deviceId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'FcmToken',
            tableName: 'FcmTokens',
            timestamps: true,
        }
    );

    return FcmToken;
};
