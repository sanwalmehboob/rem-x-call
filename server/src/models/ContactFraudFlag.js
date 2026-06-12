const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ContactFraudFlag extends Model {}

    ContactFraudFlag.init(
        {
            contactId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'pending_review',
            },
            flaggedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'ContactFraudFlag',
            tableName: 'ContactFraudFlags',
            timestamps: true,
        }
    );

    return ContactFraudFlag;
};
