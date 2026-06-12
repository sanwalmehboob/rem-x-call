'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Companies', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
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

        await queryInterface.addColumn('Users', 'companyId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Companies',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });

        await queryInterface.sequelize.query('DELETE FROM Messages');
        await queryInterface.removeColumn('Messages', 'contactId');
        await queryInterface.removeColumn('Messages', 'direction');

        await queryInterface.addColumn('Messages', 'companyId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Companies',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });

        await queryInterface.changeColumn('Messages', 'senderUserId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query('DELETE FROM Messages');
        await queryInterface.removeColumn('Messages', 'companyId');
        await queryInterface.changeColumn('Messages', 'senderUserId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
        await queryInterface.addColumn('Messages', 'contactId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'Contacts', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
        await queryInterface.addColumn('Messages', 'direction', {
            type: Sequelize.ENUM('inbound', 'outbound'),
            allowNull: false,
            defaultValue: 'outbound',
        });
        await queryInterface.removeColumn('Users', 'companyId');
        await queryInterface.dropTable('Companies');
    },
};
