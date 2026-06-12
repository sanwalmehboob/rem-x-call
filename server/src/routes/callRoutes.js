const express = require('express');
const callController = require('../controllers/callController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/initiate', callController.initiateCall);

module.exports = router;
