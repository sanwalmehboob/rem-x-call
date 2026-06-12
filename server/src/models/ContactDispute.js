const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ContactDispute extends Model {}

    ContactDispute.init(
        {
            contactId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            disputeType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'pending_review',
            },
        },
        {
            sequelize,
            modelName: 'ContactDispute',
            tableName: 'ContactDisputes',
            timestamps: true,
        }
    );

    return ContactDispute;
};
