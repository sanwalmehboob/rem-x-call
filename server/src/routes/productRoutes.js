const express = require('express');
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', productController.listProducts);
router.get('/stats', productController.getProductStats);
router.get('/out-of-stock', productController.getOutOfStockProducts);
router.post('/', productController.createProduct);
router.get('/:productId', productController.getProduct);
router.put('/:productId', productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);

module.exports = router;
