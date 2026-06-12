'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Messages', 'attachmentUrl', {
            type: Sequelize.STRING(2048),
            allowNull: true,
        });
        await queryInterface.addColumn('Messages', 'attachmentOriginalName', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.changeColumn('Messages', 'content', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Messages', 'content', {
            type: Sequelize.TEXT,
            allowNull: false,
        });
        await queryInterface.removeColumn('Messages', 'attachmentOriginalName');
        await queryInterface.removeColumn('Messages', 'attachmentUrl');
    },
};
