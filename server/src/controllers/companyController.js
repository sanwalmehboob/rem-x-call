const catchAsync = require('../utils/catchAsync');
const companyService = require('../services/companyService');

const listCompanies = catchAsync(async (req, res) => {
    const tab = req.query.tab || 'all';
    const result = await companyService.listCompaniesForAdmin({
        tab,
        q: req.query.q || '',
        page: req.query.page,
        pageSize: req.query.pageSize,
    });
    res.send({ companies: result.items, pagination: result.pagination });
});

const createCompany = catchAsync(async (req, res) => {
    const result = await companyService.createCompanyWithAgent(req.body);
    res.status(201).send(result);
});

const getCompany = catchAsync(async (req, res) => {
    const company = await companyService.getCompanyById(req.params.companyId);
    res.send({ company });
});

const updateCompany = catchAsync(async (req, res) => {
    const company = await companyService.updateCompanyByAdmin(req.params.companyId, req.body, req.user);
    res.send({ company });
});

const resendInvite = catchAsync(async (req, res) => {
    const result = await companyService.resendCompanyInvite(req.params.companyId);
    res.send(result);
});

const cancelInvite = catchAsync(async (req, res) => {
    const result = await companyService.cancelCompanyInvite(req.params.companyId);
    res.send(result);
});

const deleteCompany = catchAsync(async (req, res) => {
    const result = await companyService.deleteCompanyByAdmin(req.params.companyId);
    res.send(result);
});

const bulkDeleteCompanies = catchAsync(async (req, res) => {
    const result = await companyService.deleteCompaniesByAdmin(req.body?.companyIds);
    res.send(result);
});

const myBranding = catchAsync(async (req, res) => {
    const branding = await companyService.getCompanyBrandingForUser(req.user);
    if (branding && branding.whiteLabelLogoUrl) {
        const { getMediaUrl } = require('../utils/mediaUrl');
        branding.whiteLabelLogoUrl = getMediaUrl(req, branding.whiteLabelLogoUrl);
    }
    res.send({ branding });
});

const updateMyBranding = catchAsync(async (req, res) => {
    const branding = await companyService.updateCompanyBrandingForUser(req.user, req.body);
    if (branding && branding.whiteLabelLogoUrl) {
        const { getMediaUrl } = require('../utils/mediaUrl');
        branding.whiteLabelLogoUrl = getMediaUrl(req, branding.whiteLabelLogoUrl);
    }
    res.send({ branding });
});

const uploadLogo = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'file is required' });
    }
    await companyService.assertWhiteLabelAccessForUser(req.user);
    const { getMediaUrl } = require('../utils/mediaUrl');
    const url = getMediaUrl(req, `/uploads/chat/${req.file.filename}`);
    res.status(201).send({
        url,
        originalName: req.file.originalname,
    });
});

module.exports = {
    listCompanies,
    createCompany,
    bulkDeleteCompanies,
    getCompany,
    updateCompany,
    resendInvite,
    cancelInvite,
    deleteCompany,
    myBranding,
    updateMyBranding,
    uploadLogo,
};
