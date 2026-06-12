const catchAsync = require('../utils/catchAsync');
const productService = require('../services/productService');

const listProducts = catchAsync(async (req, res) => {
    const result = await productService.getProducts({
        search: req.query.search || '',
        name: req.query.name || '',
        category: req.query.category || '',
        status: req.query.status || '',
        page: req.query.page,
        pageSize: req.query.pageSize,
        userId: req.user ? req.user.id : null,
    });

    res.send({ data: result.items, products: result.items, pagination: result.pagination });
});

const getProduct = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.productId);
    res.send({ product });
});

const createProduct = catchAsync(async (req, res) => {
    const product = await productService.createProduct(req.body, req.user ? req.user.id : null);
    res.status(201).send({ product });
});

const updateProduct = catchAsync(async (req, res) => {
    const product = await productService.updateProduct(req.params.productId, req.body, req.user ? req.user.id : null);
    res.send({ product });
});

const deleteProduct = catchAsync(async (req, res) => {
    await productService.deleteProduct(req.params.productId, req.user ? req.user.id : null);
    res.status(204).send();
});

const getProductStats = catchAsync(async (req, res) => {
    const stats = await productService.getProductStats({
        period: req.query.period,
    });
    res.send(stats);
});

const getOutOfStockProducts = catchAsync(async (req, res) => {
    const result = await productService.getOutOfStockProducts({
        page: req.query.page,
        pageSize: req.query.pageSize,
        userId: req.user ? req.user.id : null,
    });
    res.send({ data: result.items, products: result.items, pagination: result.pagination });
});

module.exports = {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats,
    getOutOfStockProducts,
};
