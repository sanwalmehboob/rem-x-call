const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Company extends Model {}

    Company.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            businessEmail: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            subscriptionPlanId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            inviteStatus: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'active',
            },
            inviteSentAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            inviteCancelledAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            subscriptionStatus: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'active',
            },
            trialEndsAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            discountPercent: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0,
            },
            whiteLabelLogoUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            primaryBrandColor: {
                type: DataTypes.STRING(32),
                allowNull: true,
            },
            secondaryBrandColor: {
                type: DataTypes.STRING(32),
                allowNull: true,
            },
            brandFont: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Company',
            tableName: 'Companies',
            timestamps: true,
        }
    );

    return Company;
};
