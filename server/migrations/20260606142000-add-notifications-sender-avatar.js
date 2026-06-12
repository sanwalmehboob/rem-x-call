'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Notifications', 'senderAvatarUrl', {
            type: Sequelize.STRING(2048),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Notifications', 'senderAvatarUrl');
    },
};
