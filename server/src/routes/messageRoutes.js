const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');
const chatUpload = require('../middleware/chatUpload');

const router = express.Router();

router.use(authenticate);

router.get('/conversations', messageController.listConversations);
router.get('/unread-count', messageController.unreadCount);
router.post('/read', messageController.markRead);
router.get('/peer', messageController.getPeer);
router.post('/upload', chatUpload.single('file'), messageController.uploadAttachment);
router.get('/', messageController.listMessages);
router.post('/', messageController.createMessage);
router.patch('/:messageId/status', messageController.updateMessageStatus);

module.exports = router;
