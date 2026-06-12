const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class CallLog extends Model {}

    CallLog.init(
        {
            contactId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            agentUserId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            outcome: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Unknown',
            },
            status: {
                type: DataTypes.ENUM('in_progress', 'completed', 'missed'),
                allowNull: false,
                defaultValue: 'in_progress',
            },
            durationSeconds: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            startedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            recordingUrl: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            flaggedNote: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'None',
            },
        },
        {
            sequelize,
            modelName: 'CallLog',
            tableName: 'CallLogs',
            timestamps: true,
        }
    );

    return CallLog;
};
