'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserSessions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            sid: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            refreshTokenHash: {
                type: Sequelize.STRING(128),
                allowNull: false,
            },
            refreshTokenExpiresAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            clientType: {
                type: Sequelize.ENUM('web', 'mobile', 'unknown'),
                allowNull: false,
                defaultValue: 'unknown',
            },
            platform: {
                type: Sequelize.STRING(64),
                allowNull: true,
            },
            appVersion: {
                type: Sequelize.STRING(32),
                allowNull: true,
            },
            deviceId: {
                type: Sequelize.STRING(128),
                allowNull: true,
            },
            deviceName: {
                type: Sequelize.STRING(128),
                allowNull: true,
            },
            ipAddress: {
                type: Sequelize.STRING(64),
                allowNull: true,
            },
            userAgent: {
                type: Sequelize.STRING(512),
                allowNull: true,
            },
            lastSeenAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            revokedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            revokedReason: {
                type: Sequelize.STRING(191),
                allowNull: true,
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

        await queryInterface.addIndex('UserSessions', ['userId']);
        await queryInterface.addIndex('UserSessions', ['deviceId']);
        await queryInterface.addIndex('UserSessions', ['revokedAt']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('UserSessions');
    },
};
