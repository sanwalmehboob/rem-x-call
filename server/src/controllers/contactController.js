const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const contactService = require('../services/contactService');

const listContacts = catchAsync(async (req, res) => {
    const assignedAgentId = req.user.role === 'user' ? req.user.id : undefined;

    const result = await contactService.getContacts({
        tab: req.query.tab || 'unassigned',
        search: req.query.search || '',
        page: req.query.page,
        pageSize: req.query.pageSize,
        assignedAgentId,
        callStatus: req.query.callStatus,
        lastContacted: req.query.lastContacted,
        req,
    });

    res.send({ data: result.items, contacts: result.items, pagination: result.pagination });
});

const listCallLogs = catchAsync(async (req, res) => {
    const result = await contactService.getCallLogs({
        search: req.query.search || '',
        page: req.query.page,
        pageSize: req.query.pageSize,
        req,
    });

    res.send({ data: result.items, callLogs: result.items, pagination: result.pagination });
});

const listAssignableAgents = catchAsync(async (req, res) => {
    const result = await contactService.getAssignableAgents({
        page: req.query.page,
        pageSize: req.query.pageSize,
    });
    res.send({ data: result.items, agents: result.items, pagination: result.pagination });
});

const createContact = catchAsync(async (req, res) => {
    const contact = await contactService.createContact(req.body);
    res.status(201).send({ contact });
});

const updateContact = catchAsync(async (req, res) => {
    const contact = await contactService.updateContact(req.params.contactId, req.body);
    res.send({ contact });
});

const deleteContact = catchAsync(async (req, res) => {
    await contactService.deleteContact(req.params.contactId);
    res.status(204).send();
});

const assignContact = catchAsync(async (req, res) => {
    const contact = await contactService.assignContact(req.params.contactId, req.body.agentUserId);
    res.send({ contact });
});

const unassignContact = catchAsync(async (req, res) => {
    const contact = await contactService.unassignContact(req.params.contactId);
    res.send({ contact });
});

const getContact = catchAsync(async (req, res) => {
    const contact = await contactService.getContactById(req.params.contactId);
    // Format avatar URL if present
    const formattedContact = contact.toJSON();
    const { getMediaUrl } = require('../utils/mediaUrl');
    formattedContact.avatarUrl = getMediaUrl(req, formattedContact.avatarUrl);
    res.send({ contact: formattedContact });
});

const getContactCalls = catchAsync(async (req, res) => {
    const result = await contactService.getCallsForContact(req.params.contactId, {
        page: req.query.page,
        pageSize: req.query.pageSize,
        req,
    });
    res.send({ data: result.items, calls: result.items, pagination: result.pagination });
});

const getContactOverview = catchAsync(async (req, res) => {
    const overview = await contactService.getContactOverview(req.params.contactId, {
        period: req.query.period,
    });
    res.send(overview);
});

const flagFraud = catchAsync(async (req, res) => {
    const fraudFlag = await contactService.flagFraud(req.params.contactId, req.body);
    res.status(201).send(fraudFlag);
});

const raiseDispute = catchAsync(async (req, res) => {
    const dispute = await contactService.raiseDispute(req.params.contactId, req.body);
    res.status(201).send(dispute);
});

const getDisputeTypes = catchAsync(async (req, res) => {
    const types = await contactService.getDisputeTypes();
    res.send({ disputeTypes: types });
});

module.exports = {
    listContacts,
    listCallLogs,
    listAssignableAgents,
    createContact,
    updateContact,
    deleteContact,
    assignContact,
    unassignContact,
    getContact,
    getContactCalls,
    getContactOverview,
    flagFraud,
    raiseDispute,
    getDisputeTypes,
};
