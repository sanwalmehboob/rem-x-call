'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'profileImageUrl', {
            type: Sequelize.STRING(2048),
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Users', 'profileImageUrl');
    },
};
