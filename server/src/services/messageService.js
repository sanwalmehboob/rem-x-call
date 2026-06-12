const { Op } = require('sequelize');
const { Company, Message, User } = require('../models');
const ApiError = require('../utils/ApiError');

const MESSAGE_STATUSES = new Set(['pending', 'sent', 'delivered', 'read', 'failed']);
/** Count as unread for badges until explicitly read (excludes failed deliveries). */
const UNREAD_STATUSES = ['pending', 'sent', 'delivered'];

const companyIdsMatchingAgentSearch = async (trimmed) => {
    if (!trimmed) return [];
    const agentRows = await User.findAll({
        where: {
            role: 'user',
            companyId: { [Op.ne]: null },
            [Op.or]: [
                { username: { [Op.like]: `%${trimmed}%` } },
                { email: { [Op.like]: `%${trimmed}%` } },
                { firstName: { [Op.like]: `%${trimmed}%` } },
                { lastName: { [Op.like]: `%${trimmed}%` } },
            ],
        },
        attributes: ['companyId'],
        raw: true,
    });
    return [...new Set(agentRows.map((r) => r.companyId).filter(Boolean))];
};

const MESSAGE_INCLUDE = [
    {
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'email', 'role'],
        required: true,
    },
];

const normalizeValue = (value) => (typeof value === 'string' ? value.trim() : '');

const toSafeInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
        return fallback;
    }
    return parsed;
};
const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const parseCompanyId = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};

const getCompanyById = async (companyId) => {
    const company = await Company.findByPk(companyId);
    if (!company) {
        throw new ApiError(404, 'Company not found');
    }
    return company;
};

const resolveCompanyIdForRead = (user, queryCompanyId) => {
    if (user.role === 'admin') {
        const id = parseCompanyId(queryCompanyId);
        if (!id) {
            throw new ApiError(400, 'companyId is required');
        }
        return id;
    }
    if (!user.companyId) {
        throw new ApiError(403, 'No company is assigned to this account');
    }
    if (queryCompanyId !== undefined && queryCompanyId !== null && `${queryCompanyId}` !== '') {
        const requested = parseCompanyId(queryCompanyId);
        if (requested && requested !== user.companyId) {
            throw new ApiError(403, 'Forbidden');
        }
    }
    return user.companyId;
};

const resolveCompanyIdForWrite = (user, bodyCompanyId) => {
    if (user.role === 'admin') {
        const id = parseCompanyId(bodyCompanyId);
        if (!id) {
            throw new ApiError(400, 'companyId is required');
        }
        return id;
    }
    if (!user.companyId) {
        throw new ApiError(403, 'No company is assigned to this account');
    }
    return user.companyId;
};

const assertCanAccessCompany = async (user, companyId) => {
    await getCompanyById(companyId);
    if (user.role === 'admin') {
        return;
    }
    if (user.companyId !== companyId) {
        throw new ApiError(403, 'Forbidden');
    }
};

const getMessageByIdWithSender = async (messageId) => {
    const message = await Message.findByPk(messageId, {
        include: MESSAGE_INCLUDE,
    });
    if (!message) {
        throw new ApiError(404, 'Message not found');
    }
    return message;
};

const getMessages = async ({ user, companyId: queryCompanyId, limit = 50, offset = 0, page, pageSize } = {}) => {
    const companyId = resolveCompanyIdForRead(user, queryCompanyId);
    const safePageSize = Math.min(toPositiveInt(pageSize || limit, 50), 100);
    const safePage = toPositiveInt(page, Math.floor(toSafeInteger(offset, 0) / safePageSize) + 1);
    const safeOffset = (safePage - 1) * safePageSize;

    const { rows, count } = await Message.findAndCountAll({
        where: { companyId },
        include: MESSAGE_INCLUDE,
        order: [
            ['sentAt', 'ASC'],
            ['id', 'ASC'],
        ],
        limit: safePageSize,
        offset: safeOffset,
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

const listConversationsForAdmin = async ({ q, page = 1, pageSize = 20 } = {}) => {
    const trimmed = normalizeValue(q);
    const safePage = toPositiveInt(page, 1);
    const safePageSize = Math.min(toPositiveInt(pageSize, 20), 100);
    const offset = (safePage - 1) * safePageSize;
    let where;
    if (trimmed) {
        const agentCompanyIds = await companyIdsMatchingAgentSearch(trimmed);
        where = {
            [Op.or]: [
                { name: { [Op.like]: `%${trimmed}%` } },
                ...(agentCompanyIds.length ? [{ id: { [Op.in]: agentCompanyIds } }] : []),
            ],
        };
    }

    const sequelize = Company.sequelize;
    const { rows: companies, count } = await Company.findAndCountAll({
        where,
        attributes: {
            include: [
                [
                    sequelize.literal('(SELECT MAX(sentAt) FROM Messages WHERE Messages.companyId = Company.id)'),
                    'lastMessageSentAt'
                ]
            ]
        },
        include: [
            {
                model: User,
                as: 'members',
                required: false,
                attributes: ['id', 'username', 'email', 'role', 'companyId', 'profileImageUrl'],
            },
        ],
        order: [
            [sequelize.literal('lastMessageSentAt'), 'DESC'],
            ['name', 'ASC']
        ],
        distinct: true,
        limit: safePageSize,
        offset,
    });

    const rows = await Promise.all(
        companies.map(async (company) => {
            const members = company.members || [];
            const agent = members.find((m) => m.role === 'user') || members[0] || null;
            const lastMessage = await Message.findOne({
                where: { companyId: company.id },
                include: MESSAGE_INCLUDE,
                order: [
                    ['sentAt', 'DESC'],
                    ['id', 'DESC'],
                ],
            });

            return {
                company: { id: company.id, name: company.name },
                agent: agent
                    ? {
                          id: agent.id,
                          username: agent.username,
                          email: agent.email,
                          profileImageUrl: agent.profileImageUrl,
                      }
                    : null,
                lastMessage: lastMessage ? lastMessage.toJSON() : null,
            };
        })
    );

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

const createMessage = async (payload = {}, user) => {
    const companyId = resolveCompanyIdForWrite(user, payload.companyId);
    await assertCanAccessCompany(user, companyId);

    const content = normalizeValue(payload.content);
    const attachmentUrl = payload.attachmentUrl ? String(payload.attachmentUrl).trim().slice(0, 2048) : null;
    const attachmentOriginalName = payload.attachmentOriginalName
        ? String(payload.attachmentOriginalName).trim().slice(0, 255)
        : null;

    if (!content && !attachmentUrl) {
        throw new ApiError(400, 'Message text or an attachment is required');
    }

    const status = payload.status || 'sent';
    if (!MESSAGE_STATUSES.has(status)) {
        throw new ApiError(400, 'Invalid message status');
    }

    const created = await Message.create({
        companyId,
        senderUserId: user.id,
        content: content || null,
        attachmentUrl,
        attachmentOriginalName,
        status,
        sentAt: payload.sentAt || new Date(),
    });

    // Send push notification trigger asynchronously
    try {
        const notificationService = require('./notificationService');
        if (user.role === 'admin') {
            // Admin sent message to Agent
            const recipientAgent = await User.findOne({
                where: { companyId, role: 'user' },
            });
            if (recipientAgent) {
                await notificationService.createNotification({
                    userId: recipientAgent.id,
                    title: 'New Message from Admin',
                    body: content || 'Sent an attachment',
                    type: 'chat',
                    senderAvatarUrl: user.profileImageUrl,
                    dataPayload: {
                        companyId: String(companyId),
                        messageId: String(created.id),
                        senderId: String(user.id),
                    },
                });
            }
        } else {
            // Agent sent message to Admin
            const recipientAdmin = await User.findOne({
                where: { role: 'admin' },
                order: [['id', 'ASC']],
            });
            if (recipientAdmin) {
                const senderName = (user.firstName && user.lastName)
                    ? `${user.firstName} ${user.lastName}`.trim()
                    : user.username;
                await notificationService.createNotification({
                    userId: recipientAdmin.id,
                    title: `New Message from ${senderName}`,
                    body: content || 'Sent an attachment',
                    type: 'chat',
                    senderAvatarUrl: user.profileImageUrl,
                    dataPayload: {
                        companyId: String(companyId),
                        messageId: String(created.id),
                        senderId: String(user.id),
                    },
                });
            }
        }
    } catch (pushError) {
        const logger = require('../utils/logger');
        logger.error('[MessageService] Error triggering push notification:', pushError);
    }

    return getMessageByIdWithSender(created.id);
};

const markIncomingMessagesReadInCompany = async (user, rawCompanyId) => {
    const companyId = parseCompanyId(rawCompanyId);
    if (!companyId) {
        throw new ApiError(400, 'companyId is required');
    }
    await assertCanAccessCompany(user, companyId);
    const [updated] = await Message.update(
        { status: 'read' },
        {
            where: {
                companyId,
                senderUserId: { [Op.ne]: user.id },
                status: { [Op.in]: UNREAD_STATUSES },
            },
        }
    );
    return updated;
};

const updateMessageStatus = async (messageId, status, user) => {
    if (!MESSAGE_STATUSES.has(status)) {
        throw new ApiError(400, 'Invalid message status');
    }

    const message = await getMessageByIdWithSender(messageId);
    await assertCanAccessCompany(user, message.companyId);

    message.status = status;
    await message.save();
    return getMessageByIdWithSender(message.id);
};

const getPeerForThread = async (user, queryCompanyId, req) => {
    const { getMediaUrl } = require('../utils/mediaUrl');
    if (user.role === 'admin') {
        const companyId = parseCompanyId(queryCompanyId);
        if (!companyId) {
            throw new ApiError(400, 'companyId is required');
        }
        await assertCanAccessCompany(user, companyId);
        const agent = await User.findOne({
            where: { companyId, role: 'user' },
            attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName', 'profileImageUrl'],
            order: [['id', 'ASC']],
        });
        
        if (agent) {
            const peerObj = agent.toJSON();
            const name = (peerObj.firstName && peerObj.lastName) ? `${peerObj.firstName} ${peerObj.lastName}`.trim() : peerObj.username;
            return {
                ...peerObj,
                peerId: peerObj.id,
                peerName: name,
                peerAvatarUrl: getMediaUrl(req, peerObj.profileImageUrl),
            };
        }
        
        return {
            username: 'Agent',
            email: null,
            peerId: null,
            peerName: 'Agent',
            peerAvatarUrl: null,
        };
    }

    if (!user.companyId) {
        throw new ApiError(403, 'No company is assigned to this account');
    }

    const admin = await User.findOne({
        where: { role: 'admin' },
        attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName', 'profileImageUrl'],
        order: [['id', 'ASC']],
    });

    if (admin) {
        const peerObj = admin.toJSON();
        const name = (peerObj.firstName && peerObj.lastName) ? `${peerObj.firstName} ${peerObj.lastName}`.trim() : peerObj.username;
        return {
            ...peerObj,
            peerId: peerObj.id,
            peerName: name,
            peerAvatarUrl: getMediaUrl(req, peerObj.profileImageUrl),
        };
    }

    return {
        username: 'Admin',
        email: null,
        peerId: null,
        peerName: 'Admin',
        peerAvatarUrl: null,
    };
};

const getUnreadMessageCount = async (user) => {
    const where = {
        senderUserId: { [Op.ne]: user.id },
        status: { [Op.in]: UNREAD_STATUSES },
    };
    if (user.role === 'user') {
        if (!user.companyId) {
            return 0;
        }
        where.companyId = user.companyId;
    }
    return Message.count({ where });
};

module.exports = {
    getMessages,
    listConversationsForAdmin,
    createMessage,
    updateMessageStatus,
    getPeerForThread,
    getUnreadMessageCount,
    markIncomingMessagesReadInCompany,
};
