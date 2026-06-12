'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Contacts', 'avatarUrl', {
            type: Sequelize.STRING(2048),
            allowNull: true,
        });
        await queryInterface.addColumn('Contacts', 'followUpDate', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Contacts', 'avatarUrl');
        await queryInterface.removeColumn('Contacts', 'followUpDate');
    },
};
