const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const profileAvatarUpload = require('../middleware/profileAvatarUpload');

const router = express.Router();

router.post('/bootstrap-first-admin', authController.bootstrapFirstAdmin);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-tokens', authController.refreshTokens);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateMe);
router.post('/me/avatar', authenticate, profileAvatarUpload.single('file'), authController.uploadAvatar);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/sessions', authenticate, authController.listMySessions);
router.delete('/sessions/:sid', authenticate, authController.revokeMySession);

module.exports = router;
