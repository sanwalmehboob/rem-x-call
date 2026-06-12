const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SubscriptionPlan extends Model {}

    SubscriptionPlan.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            priceMonthly: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            billingCycle: {
                type: DataTypes.ENUM('monthly', 'yearly'),
                allowNull: false,
                defaultValue: 'monthly',
            },
            maxAgents: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            contactLimitLabel: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            dialerEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            chatEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            recordingEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            whiteLabelEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: 'SubscriptionPlan',
            tableName: 'SubscriptionPlans',
            timestamps: true,
        }
    );

    return SubscriptionPlan;
};
