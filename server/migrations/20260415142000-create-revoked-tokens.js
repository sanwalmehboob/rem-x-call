'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('RevokedTokens', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            jti: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false,
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
        await queryInterface.dropTable('RevokedTokens');
    },
};
