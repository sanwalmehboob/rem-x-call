const express = require('express');
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', contactController.listContacts);
router.post('/', contactController.createContact);
router.get('/call-logs', contactController.listCallLogs);
router.get('/agents', contactController.listAssignableAgents);
router.get('/dispute-types', contactController.getDisputeTypes);

router.get('/:contactId', contactController.getContact);
router.get('/:contactId/overview', contactController.getContactOverview);
router.get('/:contactId/calls', contactController.getContactCalls);
router.patch('/:contactId', contactController.updateContact);
router.delete('/:contactId', contactController.deleteContact);
router.post('/:contactId/assign', contactController.assignContact);
router.post('/:contactId/unassign', contactController.unassignContact);
router.post('/:contactId/dispute', contactController.raiseDispute);
router.post('/:contactId/flag-fraud', contactController.flagFraud);

module.exports = router;
