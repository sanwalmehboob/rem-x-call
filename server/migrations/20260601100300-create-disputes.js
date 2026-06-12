'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ContactDisputes', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            contactId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Contacts',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            disputeType: {
                type: Sequelize.STRING, // e.g. 'incorrect_billing', 'service_not_provided', 'other'
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING, // e.g. 'pending_review', 'resolved', 'rejected'
                allowNull: false,
                defaultValue: 'pending_review',
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
        await queryInterface.dropTable('ContactDisputes');
    },
};
