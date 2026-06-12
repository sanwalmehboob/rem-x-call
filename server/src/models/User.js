const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    class User extends Model {
        /**
         * Check if password matches the user's password
         * @param {string} password
         * @returns {Promise<boolean>}
         */
        async isPasswordMatch(password) {
            return bcrypt.compare(password, this.password);
        }

        toJSON() {
            const values = { ...this.get() };
            delete values.password;
            return values;
        }
    }

    User.init(
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [8, 100],
                },
            },
            role: {
                type: DataTypes.ENUM('admin', 'user'),
                defaultValue: 'user',
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            firstName: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            lastName: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING(32),
                allowNull: true,
            },
            profileImageUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            sipExtension: {
                type: DataTypes.STRING(32),
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'Users',
            timestamps: true,
            hooks: {
                beforeCreate: async (user) => {
                    if (user.password) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                },
                beforeUpdate: async (user) => {
                    if (user.changed('password')) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                },
            },
        }
    );

    return User;
};
