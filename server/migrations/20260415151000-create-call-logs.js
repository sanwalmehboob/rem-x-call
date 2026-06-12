'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('CallLogs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
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
            agentUserId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            outcome: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'Unknown',
            },
            status: {
                type: Sequelize.ENUM('in_progress', 'completed', 'missed'),
                allowNull: false,
                defaultValue: 'in_progress',
            },
            durationSeconds: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            startedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            recordingUrl: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            flaggedNote: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'None',
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable('CallLogs');
    },
};
