const express = require('express');
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { authenticate } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', subscriptionPlanController.listPlans);
router.post('/', subscriptionPlanController.createPlan);
router.patch('/:planId', subscriptionPlanController.updatePlan);
router.delete('/:planId', subscriptionPlanController.deletePlan);

module.exports = router;
