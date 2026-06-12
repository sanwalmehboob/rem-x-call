const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class RevokedToken extends Model {}

    RevokedToken.init(
        {
            jti: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'RevokedToken',
            tableName: 'RevokedTokens',
            timestamps: true,
        }
    );

    return RevokedToken;
};
