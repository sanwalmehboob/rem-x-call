const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Product extends Model {}

    Product.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            image: {
                type: DataTypes.TEXT('long'),
                allowNull: true,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Available',
            },
            qty: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            sold: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Product',
            tableName: 'Products',
            timestamps: true,
        }
    );

    return Product;
};
