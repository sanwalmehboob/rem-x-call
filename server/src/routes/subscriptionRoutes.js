const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/current', subscriptionController.getCurrentSubscription);
router.get('/history', subscriptionController.getSubscriptionHistory);

module.exports = router;
