'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('SubscriptionHistories', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            companyId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Companies',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            planName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            action: {
                type: Sequelize.STRING, // e.g. 'subscribed', 'renewed', 'upgraded', 'downgraded', 'cancelled'
                allowNull: false,
            },
            billingCycle: {
                type: Sequelize.STRING, // e.g. 'monthly', 'yearly'
                allowNull: false,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00,
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            status: {
                type: Sequelize.STRING, // e.g. 'paid', 'pending', 'refunded'
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('SubscriptionHistories');
    },
};
