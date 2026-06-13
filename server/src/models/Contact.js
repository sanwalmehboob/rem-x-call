const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Contact extends Model {}

    Contact.init(
        {
            fullName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            companyName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive'),
                allowNull: false,
                defaultValue: 'active',
            },
            assignedAgentId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            avatarUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            followUpDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Contact',
            tableName: 'Contacts',
            timestamps: true,
        }
    );

    return Contact;
};
