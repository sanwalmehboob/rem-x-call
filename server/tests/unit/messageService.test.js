const { Company, Message, User } = require('../../src/models');
const messageService = require('../../src/services/messageService');
const ApiError = require('../../src/utils/ApiError');

jest.mock('../../src/models', () => ({
    Company: {
        findByPk: jest.fn(),
        findAndCountAll: jest.fn(),
    },
    Message: {
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
        findOne: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
    },
    User: {
        findOne: jest.fn(),
    },
}));

describe('messageService', () => {
    const adminUser = { id: 1, role: 'admin', companyId: null };
    const agentUser = { id: 9, role: 'user', companyId: 3 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getMessages', () => {
        it('throws when admin omits companyId', async () => {
            await expect(messageService.getMessages({ user: adminUser })).rejects.toBeInstanceOf(ApiError);
            await expect(messageService.getMessages({ user: adminUser })).rejects.toThrow('companyId is required');
        });

        it('throws when agent has no company', async () => {
            await expect(messageService.getMessages({ user: { id: 2, role: 'user', companyId: null } })).rejects.toThrow(
                'No company is assigned'
            );
        });

        it('lists messages for company with sender include', async () => {
            Company.findByPk.mockResolvedValue({ id: 3 });
            Message.findAndCountAll.mockResolvedValue({
                rows: [{ id: 4, content: 'Hello' }],
                count: 1,
            });

            const result = await messageService.getMessages({ user: adminUser, companyId: 3, limit: 25, offset: 0 });

            expect(result.items).toEqual([{ id: 4, content: 'Hello' }]);
            expect(Message.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { companyId: 3 },
                    include: [
                        expect.objectContaining({
                            model: User,
                            as: 'sender',
                        }),
                    ],
                    order: [
                        ['sentAt', 'ASC'],
                        ['id', 'ASC'],
                    ],
                    limit: 25,
                    offset: 0,
                })
            );
        });
    });

    describe('createMessage', () => {
        it('creates message for admin with companyId', async () => {
            Company.findByPk.mockResolvedValue({ id: 3 });
            Message.create.mockResolvedValue({ id: 2 });
            Message.findByPk.mockResolvedValue({ id: 2, companyId: 3, senderUserId: 1, content: 'Hi' });

            const result = await messageService.createMessage(
                {
                    companyId: 3,
                    content: '  follow up update ',
                },
                adminUser
            );

            expect(result).toEqual({ id: 2, companyId: 3, senderUserId: 1, content: 'Hi' });
            expect(Message.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    companyId: 3,
                    content: 'follow up update',
                    senderUserId: 1,
                    status: 'sent',
                })
            );
        });

        it('creates message for agent using their company', async () => {
            Company.findByPk.mockResolvedValue({ id: 3 });
            Message.create.mockResolvedValue({ id: 5 });
            Message.findByPk.mockResolvedValue({ id: 5, companyId: 3, senderUserId: 9 });

            await messageService.createMessage({ content: 'Hello admin' }, agentUser);

            expect(Message.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    companyId: 3,
                    senderUserId: 9,
                    content: 'Hello admin',
                })
            );
        });
    });

    describe('getUnreadMessageCount', () => {
        it('counts non-read messages from others for admin', async () => {
            Message.count.mockResolvedValue(4);
            const n = await messageService.getUnreadMessageCount(adminUser);
            expect(n).toBe(4);
            expect(Message.count).toHaveBeenCalled();
            const callArg = Message.count.mock.calls[0][0];
            expect(callArg.where.senderUserId).toBeDefined();
            expect(callArg.where.status).toBeDefined();
        });

        it('scopes unread to company for agent', async () => {
            Message.count.mockResolvedValue(2);
            const n = await messageService.getUnreadMessageCount(agentUser);
            expect(n).toBe(2);
            expect(Message.count.mock.calls[0][0].where.companyId).toBe(3);
        });

        it('returns 0 for agent without company', async () => {
            const n = await messageService.getUnreadMessageCount({ id: 2, role: 'user', companyId: null });
            expect(n).toBe(0);
            expect(Message.count).not.toHaveBeenCalled();
        });
    });

    describe('updateMessageStatus', () => {
        it('throws on invalid status', async () => {
            await expect(messageService.updateMessageStatus(2, 'unknown', adminUser)).rejects.toThrow(
                'Invalid message status'
            );
        });

        it('updates an existing message status', async () => {
            const save = jest.fn();
            Message.findByPk
                .mockResolvedValueOnce({
                    id: 2,
                    companyId: 1,
                    status: 'sent',
                    save,
                })
                .mockResolvedValueOnce({
                    id: 2,
                    companyId: 1,
                    status: 'read',
                });
            Company.findByPk.mockResolvedValue({ id: 1 });

            const result = await messageService.updateMessageStatus(2, 'read', adminUser);

            expect(result.status).toBe('read');
            expect(save).toHaveBeenCalled();
        });
    });
});
