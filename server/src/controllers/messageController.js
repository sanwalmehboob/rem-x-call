const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const messageService = require('../services/messageService');
const { emitToCompanyRoom } = require('../realtime/socket');

const listConversations = catchAsync(async (req, res) => {
    if (req.user.role === 'admin') {
        const result = await messageService.listConversationsForAdmin({
            q: req.query.q,
            page: req.query.page,
            pageSize: req.query.pageSize,
        });
        
        const { getMediaUrl } = require('../utils/mediaUrl');
        result.items.forEach(conv => {
            if (conv.lastMessage) {
                conv.lastMessage.attachmentUrl = getMediaUrl(req, conv.lastMessage.attachmentUrl);
            }
            if (conv.agent) {
                conv.agent.profileImageUrl = getMediaUrl(req, conv.agent.profileImageUrl);
            }
        });

        res.send({ data: result.items, conversations: result.items, pagination: result.pagination });
    } else {
        if (!req.user.companyId) {
            return res.send({ data: [], conversations: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } });
        }

        const { Company, Message, User } = require('../models');
        const company = await Company.findByPk(req.user.companyId);
        if (!company) {
            return res.send({ data: [], conversations: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } });
        }

        const lastMessage = await Message.findOne({
            where: { companyId: company.id },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'email', 'role'],
                    required: true,
                },
            ],
            order: [
                ['sentAt', 'DESC'],
                ['id', 'DESC'],
            ],
        });

        if (lastMessage) {
            const { getMediaUrl } = require('../utils/mediaUrl');
            if (lastMessage.attachmentUrl !== undefined) {
                if (typeof lastMessage.setDataValue === 'function') {
                    lastMessage.setDataValue('attachmentUrl', getMediaUrl(req, lastMessage.attachmentUrl));
                } else {
                    lastMessage.attachmentUrl = getMediaUrl(req, lastMessage.attachmentUrl);
                }
            }
        }

        const conversation = {
            company: { id: company.id, name: company.name },
            agent: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
            },
            lastMessage: lastMessage ? lastMessage.toJSON() : null,
        };

        res.send({
            data: [conversation],
            conversations: [conversation],
            pagination: {
                page: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
            },
        });
    }
});

const listMessages = catchAsync(async (req, res) => {
    const result = await messageService.getMessages({
        user: req.user,
        companyId: req.query.companyId,
        limit: req.query.limit,
        offset: req.query.offset,
        page: req.query.page,
        pageSize: req.query.pageSize,
    });

    const { getMediaUrl } = require('../utils/mediaUrl');
    result.items.forEach((msg) => {
        if (msg.attachmentUrl !== undefined) {
            if (typeof msg.setDataValue === 'function') {
                msg.setDataValue('attachmentUrl', getMediaUrl(req, msg.attachmentUrl));
            } else {
                msg.attachmentUrl = getMediaUrl(req, msg.attachmentUrl);
            }
        }
    });

    res.send({ data: result.items, messages: result.items, pagination: result.pagination });
});

const getPeer = catchAsync(async (req, res) => {
    const peer = await messageService.getPeerForThread(req.user, req.query.companyId, req);
    res.send({ peer });
});

const unreadCount = catchAsync(async (req, res) => {
    const count = await messageService.getUnreadMessageCount(req.user);
    res.send({ count });
});

const markRead = catchAsync(async (req, res) => {
    const updated = await messageService.markIncomingMessagesReadInCompany(req.user, req.body?.companyId);
    res.send({ updated });
});

const uploadAttachment = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'file is required');
    }
    const { getMediaUrl } = require('../utils/mediaUrl');
    const url = getMediaUrl(req, `/uploads/chat/${req.file.filename}`);
    res.status(201).send({
        url,
        originalName: req.file.originalname,
    });
});

const createMessage = catchAsync(async (req, res) => {
    const message = await messageService.createMessage(req.body, req.user);
    const { getMediaUrl } = require('../utils/mediaUrl');
    if (message.attachmentUrl !== undefined) {
        if (typeof message.setDataValue === 'function') {
            message.setDataValue('attachmentUrl', getMediaUrl(req, message.attachmentUrl));
        } else {
            message.attachmentUrl = getMediaUrl(req, message.attachmentUrl);
        }
    }
    const payload = typeof message.toJSON === 'function' ? message.toJSON() : message;
    emitToCompanyRoom(payload.companyId, 'messages:created', { message: payload });
    res.status(201).send({ message });
});

const updateMessageStatus = catchAsync(async (req, res) => {
    const message = await messageService.updateMessageStatus(req.params.messageId, req.body.status, req.user);
    const { getMediaUrl } = require('../utils/mediaUrl');
    if (message.attachmentUrl !== undefined) {
        if (typeof message.setDataValue === 'function') {
            message.setDataValue('attachmentUrl', getMediaUrl(req, message.attachmentUrl));
        } else {
            message.attachmentUrl = getMediaUrl(req, message.attachmentUrl);
        }
    }
    const payload = typeof message.toJSON === 'function' ? message.toJSON() : message;
    emitToCompanyRoom(payload.companyId, 'messages:status-updated', { message: payload });
    res.send({ message });
});

module.exports = {
    listConversations,
    listMessages,
    getPeer,
    unreadCount,
    markRead,
    uploadAttachment,
    createMessage,
    updateMessageStatus,
};
