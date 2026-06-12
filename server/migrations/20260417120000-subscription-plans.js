'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('SubscriptionPlans', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            priceMonthly: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            billingCycle: {
                type: Sequelize.ENUM('monthly', 'yearly'),
                allowNull: false,
                defaultValue: 'monthly',
            },
            maxAgents: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            contactLimitLabel: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            dialerEnabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            chatEnabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            recordingEnabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            whiteLabelEnabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            sortOrder: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addColumn('Companies', 'subscriptionPlanId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'SubscriptionPlans',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Companies', 'subscriptionPlanId');
        await queryInterface.dropTable('SubscriptionPlans');
    },
};
