const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SubscriptionHistory extends Model {}

    SubscriptionHistory.init(
        {
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            planName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            billingCycle: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'SubscriptionHistory',
            tableName: 'SubscriptionHistories',
            timestamps: true,
        }
    );

    return SubscriptionHistory;
};
