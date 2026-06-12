'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Companies', 'inviteStatus', {
            type: Sequelize.STRING(32),
            allowNull: false,
            defaultValue: 'active',
        });
        await queryInterface.addColumn('Companies', 'inviteSentAt', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.addColumn('Companies', 'inviteCancelledAt', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.addColumn('Companies', 'subscriptionStatus', {
            type: Sequelize.STRING(32),
            allowNull: false,
            defaultValue: 'active',
        });
        await queryInterface.addColumn('Companies', 'trialEndsAt', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.addColumn('Companies', 'discountPercent', {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('Companies', 'whiteLabelLogoUrl', {
            type: Sequelize.STRING(2048),
            allowNull: true,
        });
        await queryInterface.addColumn('Companies', 'primaryBrandColor', {
            type: Sequelize.STRING(32),
            allowNull: true,
        });
        await queryInterface.addColumn('Companies', 'secondaryBrandColor', {
            type: Sequelize.STRING(32),
            allowNull: true,
        });
        await queryInterface.addColumn('Companies', 'brandFont', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Companies', 'brandFont');
        await queryInterface.removeColumn('Companies', 'secondaryBrandColor');
        await queryInterface.removeColumn('Companies', 'primaryBrandColor');
        await queryInterface.removeColumn('Companies', 'whiteLabelLogoUrl');
        await queryInterface.removeColumn('Companies', 'discountPercent');
        await queryInterface.removeColumn('Companies', 'trialEndsAt');
        await queryInterface.removeColumn('Companies', 'subscriptionStatus');
        await queryInterface.removeColumn('Companies', 'inviteCancelledAt');
        await queryInterface.removeColumn('Companies', 'inviteSentAt');
        await queryInterface.removeColumn('Companies', 'inviteStatus');
    },
};
