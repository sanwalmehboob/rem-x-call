const { Op, literal } = require('sequelize');
const { Contact, CallLog, User, ContactFraudFlag, ContactDispute } = require('../models');
const ApiError = require('../utils/ApiError');
const { getMediaUrl } = require('../utils/mediaUrl');

const CONTACT_STATUSES = new Set(['active', 'inactive']);

const normalizeSearch = (value) => (typeof value === 'string' ? value.trim() : '');
const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const buildContactSearchWhere = (search) => {
    const q = normalizeSearch(search);
    if (!q) return {};
    return {
        [Op.or]: [
            { fullName: { [Op.like]: `%${q}%` } },
            { phone: { [Op.like]: `%${q}%` } },
            { companyName: { [Op.like]: `%${q}%` } },
        ],
    };
};

const getContacts = async ({ 
    tab = 'unassigned', 
    search = '', 
    page = 1, 
    pageSize = 20, 
    assignedAgentId,
    callStatus,
    lastContacted,
    req
} = {}) => {
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(toPositiveInt(pageSize, 20), 100);
    const offset = (safePage - 1) * safePageSize;
    const where = buildContactSearchWhere(search);

    if (assignedAgentId !== undefined) {
        where.assignedAgentId = assignedAgentId;
    } else {
        if (tab === 'assigned') {
            where.assignedAgentId = { [Op.ne]: null };
        } else if (tab === 'unassigned') {
            where.assignedAgentId = null;
        } else if (tab !== 'all') {
            throw new ApiError(400, 'Invalid contacts tab');
        }
    }

    // Call status & last contacted filters using latest call subqueries
    let subqueryConds = [];
    if (['answered', 'missed', 'no_answer', 'failed'].includes(callStatus)) {
        let outcomeCond = '';
        if (callStatus === 'answered') outcomeCond = '(c1.outcome IN ("Connected", "Answered") OR c1.status = "completed")';
        if (callStatus === 'missed') outcomeCond = '(c1.status = "missed" OR c1.outcome = "Missed")';
        if (callStatus === 'no_answer') outcomeCond = '(c1.outcome = "No Answer" OR c1.outcome = "no_answer")';
        if (callStatus === 'failed') outcomeCond = '(c1.outcome = "Failed")';
        subqueryConds.push(outcomeCond);
    }

    if (['today', '7d', '30d'].includes(lastContacted)) {
        let days = 0;
        if (lastContacted === 'today') days = 1;
        else if (lastContacted === '7d') days = 7;
        else if (lastContacted === '30d') days = 30;
        const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const dateStr = thresholdDate.toISOString().slice(0, 19).replace('T', ' ');
        subqueryConds.push(`c1.startedAt >= '${dateStr}'`);
    }

    if (callStatus === 'never_called') {
        where.id = { [Op.notIn]: literal('(SELECT DISTINCT contactId FROM CallLogs)') };
    } else if (subqueryConds.length > 0) {
        const subquery = `(SELECT contactId FROM CallLogs AS c1 WHERE c1.startedAt = (SELECT MAX(c2.startedAt) FROM CallLogs AS c2 WHERE c2.contactId = c1.contactId) AND ${subqueryConds.join(' AND ')})`;
        where.id = { [Op.in]: literal(subquery) };
    }

    const { rows, count } = await Contact.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'assignedAgent',
                attributes: ['id', 'username', 'email'],
                required: false,
            },
        ],
        order: [['createdAt', 'DESC']],
        limit: safePageSize,
        offset,
    });

    // Format avatar URLs
    rows.forEach(r => {
        if (r.avatarUrl !== undefined) {
            if (typeof r.setDataValue === 'function') {
                r.setDataValue('avatarUrl', getMediaUrl(req, r.avatarUrl));
            } else {
                r.avatarUrl = getMediaUrl(req, r.avatarUrl);
            }
        }
    });

    return {
        items: rows,
        pagination: {
            page: safePage,
            pageSize: safePageSize,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / safePageSize)),
        },
    };
};

const getCallLogs = async ({ search = '', page = 1, pageSize = 20, req } = {}) => {
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(toPositiveInt(pageSize, 20), 100);
    const offset = (safePage - 1) * safePageSize;
    const q = normalizeSearch(search);
    const include = [
        {
            model: Contact,
            as: 'contact',
            attributes: ['id', 'fullName', 'phone', 'companyName', 'avatarUrl'],
            required: true,
            ...(q
                ? {
                      where: {
                          [Op.or]: [
                              { fullName: { [Op.like]: `%${q}%` } },
                              { phone: { [Op.like]: `%${q}%` } },
                              { companyName: { [Op.like]: `%${q}%` } },
                          ],
                      },
                  }
                : {}),
        },
    ];

    const { rows, count } = await CallLog.findAndCountAll({
        include,
        order: [['startedAt', 'DESC']],
        limit: safePageSize,
        offset,
    });

    rows.forEach(r => {
        if (typeof r.setDataValue === 'function') {
            if (r.recordingUrl !== undefined) {
                r.setDataValue('recordingUrl', getMediaUrl(req, r.recordingUrl));
            }
            if (r.contact && typeof r.contact.setDataValue === 'function') {
                if (r.contact.avatarUrl !== undefined) {
                    r.contact.setDataValue('avatarUrl', getMediaUrl(req, r.contact.avatarUrl));
                }
            }
        } else {
            if (r.recordingUrl !== undefined) {
                r.recordingUrl = getMediaUrl(req, r.recordingUrl);
            }
            if (r.contact && r.contact.avatarUrl !== undefined) {
                r.contact.avatarUrl = getMediaUrl(req, r.contact.avatarUrl);
            }
        }
    });

    return {
        items: rows,
        pagination: {
            page: safePage,
            pageSize: safePageSize,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / safePageSize)),
        },
    };
};

const createContact = async (payload) => {
    const fullName = normalizeSearch(payload.fullName);
    const phone = normalizeSearch(payload.phone);
    const companyName = normalizeSearch(payload.companyName);

    if (!fullName || !phone || !companyName) {
        throw new ApiError(400, 'fullName, phone and companyName are required');
    }

    const createData = {
        fullName,
        phone,
        companyName,
        status: CONTACT_STATUSES.has(payload.status) ? payload.status : 'active',
    };
    if (payload.avatarUrl !== undefined) {
        createData.avatarUrl = payload.avatarUrl;
    }
    if (payload.followUpDate !== undefined) {
        createData.followUpDate = payload.followUpDate;
    }

    return Contact.create(createData);
};

const getContactById = async (contactId) => {
    const contact = await Contact.findByPk(contactId);
    if (!contact) {
        throw new ApiError(404, 'Contact not found');
    }
    return contact;
};

const updateContact = async (contactId, payload) => {
    const contact = await getContactById(contactId);

    if (payload.fullName !== undefined) {
        const fullName = normalizeSearch(payload.fullName);
        if (!fullName) throw new ApiError(400, 'fullName cannot be empty');
        contact.fullName = fullName;
    }
    if (payload.phone !== undefined) {
        const phone = normalizeSearch(payload.phone);
        if (!phone) throw new ApiError(400, 'phone cannot be empty');
        contact.phone = phone;
    }
    if (payload.companyName !== undefined) {
        const companyName = normalizeSearch(payload.companyName);
        if (!companyName) throw new ApiError(400, 'companyName cannot be empty');
        contact.companyName = companyName;
    }
    if (payload.status !== undefined) {
        if (!CONTACT_STATUSES.has(payload.status)) {
            throw new ApiError(400, 'Invalid contact status');
        }
        contact.status = payload.status;
    }
    if (payload.avatarUrl !== undefined) {
        contact.avatarUrl = payload.avatarUrl;
    }
    if (payload.followUpDate !== undefined) {
        contact.followUpDate = payload.followUpDate;
    }

    await contact.save();
    return contact;
};

const deleteContact = async (contactId) => {
    const contact = await getContactById(contactId);
    await contact.destroy();
};

const assignContact = async (contactId, agentUserId) => {
    if (!agentUserId) {
        throw new ApiError(400, 'agentUserId is required');
    }

    const agent = await User.findByPk(agentUserId);
    if (!agent) {
        throw new ApiError(404, 'Agent user not found');
    }

    const contact = await getContactById(contactId);
    contact.assignedAgentId = agentUserId;
    await contact.save();
    return contact;
};

const unassignContact = async (contactId) => {
    const contact = await getContactById(contactId);
    contact.assignedAgentId = null;
    await contact.save();
    return contact;
};

const getAssignableAgents = async ({ page = 1, pageSize = 50 } = {}) => {
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(toPositiveInt(pageSize, 50), 100);
    const offset = (safePage - 1) * safePageSize;
    const { rows, count } = await User.findAndCountAll({
        where: { isActive: true },
        attributes: ['id', 'username', 'email'],
        order: [['username', 'ASC']],
        limit: safePageSize,
        offset,
    });

    return {
        items: rows,
        pagination: {
            page: safePage,
            pageSize: safePageSize,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / safePageSize)),
        },
    };
};

const getCallsForContact = async (contactId, { page = 1, pageSize = 20, req } = {}) => {
    await getContactById(contactId);

    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(toPositiveInt(pageSize, 20), 100);
    const offset = (safePage - 1) * safePageSize;

    const { rows, count } = await CallLog.findAndCountAll({
        where: { contactId },
        order: [['startedAt', 'DESC']],
        limit: safePageSize,
        offset,
    });

    rows.forEach(r => {
        if (r.recordingUrl !== undefined) {
            if (typeof r.setDataValue === 'function') {
                r.setDataValue('recordingUrl', getMediaUrl(req, r.recordingUrl));
            } else {
                r.recordingUrl = getMediaUrl(req, r.recordingUrl);
            }
        }
    });

    return {
        items: rows,
        pagination: {
            page: safePage,
            pageSize: safePageSize,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / safePageSize)),
        },
    };
};

/**
 * Returns summary overview statistics for a contact.
 */
const getContactOverview = async (contactId, { period = '30d' } = {}) => {
    const contact = await getContactById(contactId);
    
    const safePeriod = ['30d', '60d', '90d', 'overall'].includes(period) ? period : '30d';
    let periodStart = null;
    let previousPeriodStart = null;
    let previousPeriodEnd = null;
    
    if (safePeriod !== 'overall') {
        const days = { '30d': 30, '60d': 60, '90d': 90 }[safePeriod];
        periodStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000);
        previousPeriodEnd = periodStart;
    }

    const callWhere = (start, end) => {
        const w = { contactId };
        if (start && end) {
            w.startedAt = { [Op.between]: [start, end] };
        } else if (start) {
            w.startedAt = { [Op.gte]: start };
        } else if (end) {
            w.startedAt = { [Op.lt]: end };
        }
        return w;
    };

    const totalAttempts = await CallLog.count({ where: callWhere(periodStart, null) });
    const previousAttempts = safePeriod !== 'overall' ? await CallLog.count({ where: callWhere(previousPeriodStart, previousPeriodEnd) }) : 0;
    
    const attemptsChangePercent = percentChange(totalAttempts, previousAttempts);

    const lastCall = await CallLog.findOne({
        where: { contactId },
        order: [['startedAt', 'DESC']],
    });

    return {
        contactId: Number(contactId),
        followUpDate: contact.followUpDate || (lastCall ? new Date(lastCall.startedAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null),
        totalAttempts,
        attemptsChangePercent,
        lastCallDate: lastCall ? lastCall.startedAt : null,
        lastCallStatus: lastCall ? lastCall.status : null,
    };
};

/**
 * Calculates percent change.
 */
const percentChange = (current, previous) => {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

/**
 * Flags a contact as fraudulent.
 */
const flagFraud = async (contactId, payload) => {
    await getContactById(contactId);
    const note = normalizeSearch(payload.note);
    if (!note) {
        throw new ApiError(400, 'Note is required');
    }

    const flag = await ContactFraudFlag.create({
        contactId: Number(contactId),
        note,
        status: 'pending_review',
        flaggedAt: new Date(),
    });

    return {
        id: flag.id,
        contactId: flag.contactId,
        note: flag.note,
        flaggedAt: flag.flaggedAt,
        status: flag.status,
    };
};

/**
 * Raises a billing/service dispute for a contact.
 */
const raiseDispute = async (contactId, payload) => {
    await getContactById(contactId);
    const disputeType = normalizeSearch(payload.disputeType);
    const description = normalizeSearch(payload.description);
    
    if (!disputeType || !description) {
        throw new ApiError(400, 'disputeType and description are required');
    }

    const dispute = await ContactDispute.create({
        contactId: Number(contactId),
        disputeType,
        description,
        status: 'pending_review',
    });

    return {
        id: dispute.id,
        contactId: dispute.contactId,
        disputeType: dispute.disputeType,
        description: dispute.description,
        status: dispute.status,
        createdAt: dispute.createdAt,
    };
};

/**
 * Returns list of allowed dispute types.
 */
const getDisputeTypes = async () => {
    return ['incorrect_billing', 'service_not_provided', 'other'];
};

module.exports = {
    getContacts,
    getCallLogs,
    getAssignableAgents,
    createContact,
    getContactById,
    updateContact,
    deleteContact,
    assignContact,
    unassignContact,
    getCallsForContact,
    getContactOverview,
    flagFraud,
    raiseDispute,
    getDisputeTypes,
};
