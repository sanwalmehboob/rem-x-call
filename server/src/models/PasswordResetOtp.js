const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class PasswordResetOtp extends Model {}

    PasswordResetOtp.init(
        {
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            otpHash: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            attempts: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: 'PasswordResetOtp',
            tableName: 'PasswordResetOtps',
            timestamps: true,
        }
    );

    return PasswordResetOtp;
};
