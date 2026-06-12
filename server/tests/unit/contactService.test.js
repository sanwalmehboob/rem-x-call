const { Contact, CallLog, User } = require('../../src/models');
const contactService = require('../../src/services/contactService');
const ApiError = require('../../src/utils/ApiError');

jest.mock('../../src/models', () => ({
    Contact: {
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
    },
    CallLog: {
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
    },
    User: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
    },
}));

describe('contactService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createContact', () => {
        it('creates contact when payload is valid', async () => {
            const created = { id: 1, fullName: 'Jane', phone: '111', companyName: 'Acme' };
            Contact.create.mockResolvedValue(created);

            const result = await contactService.createContact({
                fullName: 'Jane',
                phone: '111',
                companyName: 'Acme',
            });

            expect(result).toEqual(created);
            expect(Contact.create).toHaveBeenCalledWith({
                fullName: 'Jane',
                phone: '111',
                companyName: 'Acme',
                status: 'active',
            });
        });

        it('throws ApiError when required fields are missing', async () => {
            await expect(contactService.createContact({ fullName: 'Jane' })).rejects.toBeInstanceOf(ApiError);
            await expect(contactService.createContact({ fullName: 'Jane' })).rejects.toThrow(
                'fullName, phone and companyName are required'
            );
        });
    });

    describe('getContacts', () => {
        it('filters unassigned contacts by default', async () => {
            Contact.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });
            await contactService.getContacts({});
            expect(Contact.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ assignedAgentId: null }),
                })
            );
        });

        it('throws on invalid tab', async () => {
            await expect(contactService.getContacts({ tab: 'bad-tab' })).rejects.toBeInstanceOf(ApiError);
        });
    });

    describe('assignContact', () => {
        it('assigns contact to agent', async () => {
            User.findByPk.mockResolvedValue({ id: 12 });
            const save = jest.fn();
            Contact.findByPk.mockResolvedValue({ id: 7, assignedAgentId: null, save });

            const result = await contactService.assignContact(7, 12);

            expect(result.assignedAgentId).toBe(12);
            expect(save).toHaveBeenCalled();
        });

        it('throws when agent user is missing', async () => {
            User.findByPk.mockResolvedValue(null);
            await expect(contactService.assignContact(7, 99)).rejects.toThrow('Agent user not found');
        });
    });

    describe('deleteContact', () => {
        it('deletes an existing contact', async () => {
            const destroy = jest.fn();
            Contact.findByPk.mockResolvedValue({ id: 7, destroy });
            await contactService.deleteContact(7);
            expect(destroy).toHaveBeenCalled();
        });
    });

    describe('getCallLogs', () => {
        it('returns call logs ordered by startedAt', async () => {
            CallLog.findAndCountAll.mockResolvedValue({ rows: [{ id: 1 }], count: 1 });
            const result = await contactService.getCallLogs({});
            expect(result.items).toEqual([{ id: 1 }]);
            expect(CallLog.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [['startedAt', 'DESC']],
                })
            );
        });
    });

    describe('getAssignableAgents', () => {
        it('returns active users sorted by username', async () => {
            User.findAndCountAll.mockResolvedValue({ rows: [{ id: 1, username: 'agent1' }], count: 1 });
            const result = await contactService.getAssignableAgents();
            expect(result.items).toEqual([{ id: 1, username: 'agent1' }]);
            expect(User.findAndCountAll).toHaveBeenCalledWith({
                where: { isActive: true },
                attributes: ['id', 'username', 'email'],
                order: [['username', 'ASC']],
                limit: 50,
                offset: 0,
            });
        });
    });
});
