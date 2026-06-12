const express = require('express');
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const chatUpload = require('../middleware/chatUpload');

const router = express.Router();

router.use(authenticate);

router.get('/my-branding', companyController.myBranding);
router.patch('/my-branding', companyController.updateMyBranding);
router.post('/upload-logo', chatUpload.single('file'), companyController.uploadLogo);

router.use(requireAdmin);

router.get('/', companyController.listCompanies);
router.post('/', companyController.createCompany);
router.post('/bulk-delete', companyController.bulkDeleteCompanies);
router.get('/:companyId', companyController.getCompany);
router.patch('/:companyId', companyController.updateCompany);
router.delete('/:companyId', companyController.deleteCompany);
router.post('/:companyId/resend-invite', companyController.resendInvite);
router.post('/:companyId/cancel-invite', companyController.cancelInvite);

module.exports = router;
