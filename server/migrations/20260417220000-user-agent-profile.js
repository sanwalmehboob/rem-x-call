'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'firstName', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
        await queryInterface.addColumn('Users', 'lastName', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
        await queryInterface.addColumn('Users', 'phone', {
            type: Sequelize.STRING(32),
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Users', 'phone');
        await queryInterface.removeColumn('Users', 'lastName');
        await queryInterface.removeColumn('Users', 'firstName');
    },
};
