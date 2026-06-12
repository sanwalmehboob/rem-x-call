const { Op } = require('sequelize');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');

const normalizeSearch = (value) => (typeof value === 'string' ? value.trim() : '');
const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const getProducts = async ({ search = '', name = '', category = '', status = '', page = 1, pageSize = 20, userId } = {}) => {
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(toPositiveInt(pageSize, 20), 100);
    const offset = (safePage - 1) * safePageSize;
    
    const where = {};
    if (userId) {
        where.userId = userId;
    }

    const q = normalizeSearch(search);
    if (q) {
        where[Op.or] = [
            { name: { [Op.like]: `%${q}%` } },
            { category: { [Op.like]: `%${q}%` } },
        ];
    }

    const nm = normalizeSearch(name);
    if (nm && nm !== 'All products') {
        where.name = nm;
    }

    const cat = normalizeSearch(category);
    if (cat && cat !== 'All categories') {
        where.category = cat;
    }

    const st = normalizeSearch(status);
    if (st && st !== 'All status') {
        where.status = st;
    }

    const { rows, count } = await Product.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: safePageSize,
        offset,
    });

    return {
        items: rows,
        pagination: {
            page: safePage,
            pageSize: safePageSize,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / safePageSize)),
        },
    };
};

const getProductById = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    return product;
};

const createProduct = async (payload, userId) => {
    const name = normalizeSearch(payload.name);
    if (!name) {
        throw new ApiError(400, 'Product name is required');
    }

    const qty = Number.parseInt(payload.qty, 10);
    const price = Number.parseFloat(payload.price);
    
    if (Number.isNaN(qty) || qty < 0) {
        throw new ApiError(400, 'Quantity must be a positive integer');
    }
    if (Number.isNaN(price) || price < 0) {
        throw new ApiError(400, 'Price must be a positive number');
    }

    const status = qty > 0 ? 'Available' : 'Out of stock';

    return Product.create({
        name,
        image: payload.image || '',
        category: payload.category || 'Cosmetics',
        status: payload.status || status,
        qty,
        sold: Number.parseInt(payload.sold, 10) || 0,
        price,
        userId: userId || null,
    });
};

const updateProduct = async (id, payload, userId) => {
    const product = await getProductById(id);
    if (userId && product.userId !== userId) {
        throw new ApiError(403, 'Forbidden');
    }

    if (payload.name !== undefined) {
        const name = normalizeSearch(payload.name);
        if (!name) throw new ApiError(400, 'Product name cannot be empty');
        product.name = name;
    }

    if (payload.image !== undefined) {
        product.image = payload.image;
    }

    if (payload.category !== undefined) {
        product.category = payload.category;
    }

    if (payload.qty !== undefined) {
        const qty = Number.parseInt(payload.qty, 10);
        if (Number.isNaN(qty) || qty < 0) {
            throw new ApiError(400, 'Quantity must be a positive integer');
        }
        product.qty = qty;
        product.status = qty > 0 ? 'Available' : 'Out of stock';
    }

    if (payload.status !== undefined) {
        product.status = payload.status;
    }

    if (payload.sold !== undefined) {
        const sold = Number.parseInt(payload.sold, 10);
        if (Number.isNaN(sold) || sold < 0) {
            throw new ApiError(400, 'Sold count must be a positive integer');
        }
        product.sold = sold;
    }

    if (payload.price !== undefined) {
        const price = Number.parseFloat(payload.price);
        if (Number.isNaN(price) || price < 0) {
            throw new ApiError(400, 'Price must be a positive number');
        }
        product.price = price;
    }

    await product.save();
    return product;
};

const deleteProduct = async (id, userId) => {
    const product = await getProductById(id);
    if (userId && product.userId !== userId) {
        throw new ApiError(403, 'Forbidden');
    }
    await product.destroy();
};

const getOutOfStockProducts = async ({ page = 1, pageSize = 20, userId } = {}) => {
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(toPositiveInt(pageSize, 20), 100);
    const offset = (safePage - 1) * safePageSize;

    const where = { qty: 0 };
    if (userId) {
        where.userId = userId;
    }

    const { rows, count } = await Product.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: safePageSize,
        offset,
    });

    return {
        items: rows,
        pagination: {
            page: safePage,
            pageSize: safePageSize,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / safePageSize)),
        },
    };
};

const getProductStats = async ({ period = '30d' } = {}) => {
    const safePeriod = ['30d', '60d', '90d', 'overall'].includes(period) ? period : '30d';
    const days = { '30d': 30, '60d': 60, '90d': 90 }[safePeriod] || 30;
    const periodStart = safePeriod !== 'overall' ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

    let previousPeriodStart = null;
    let previousPeriodEnd = null;
    if (safePeriod !== 'overall') {
        previousPeriodStart = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000);
        previousPeriodEnd = periodStart;
    }

    const totalProducts = await Product.count();
    const currentProductsAdded = periodStart ? await Product.count({
        where: { createdAt: { [Op.gte]: periodStart } }
    }) : totalProducts;

    const previousProductsAdded = previousPeriodStart ? await Product.count({
        where: { createdAt: { [Op.between]: [previousPeriodStart, previousPeriodEnd] } }
    }) : 0;

    const totalProductsChangePercent = percentChange(currentProductsAdded, previousProductsAdded);

    const soldProducts = await Product.sum('sold') || 0;
    const currentSoldAdded = periodStart ? await Product.sum('sold', {
        where: { updatedAt: { [Op.gte]: periodStart } }
    }) || 0 : soldProducts;

    const previousSoldAdded = previousPeriodStart ? await Product.sum('sold', {
        where: { updatedAt: { [Op.between]: [previousPeriodStart, previousPeriodEnd] } }
    }) || 0 : 0;

    const soldProductsChangePercent = percentChange(currentSoldAdded, previousSoldAdded);

    return {
        totalProducts,
        totalProductsChangePercent,
        soldProducts,
        soldProductsChangePercent,
    };
};

const percentChange = (current, previous) => {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getOutOfStockProducts,
    getProductStats,
};
