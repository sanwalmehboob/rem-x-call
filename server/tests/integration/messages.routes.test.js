const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const messageService = require('../../src/services/messageService');
const { emitToCompanyRoom } = require('../../src/realtime/socket');
const { User, RevokedToken } = require('../../src/models');

jest.mock('../../src/services/messageService');
jest.mock('../../src/realtime/socket', () => ({
    emitToCompanyRoom: jest.fn(),
}));

describe('Messages routes', () => {
    let findByPkSpy;
    let revokedSpy;
    let authToken;

    beforeEach(() => {
        jest.clearAllMocks();

        findByPkSpy = jest.spyOn(User, 'findByPk').mockResolvedValue({
            id: 10,
            role: 'admin',
            companyId: null,
            isActive: true,
            toJSON: () => ({ id: 10, email: 'admin@example.com', role: 'admin' }),
        });
        revokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);
        authToken = jwt.sign({ sub: 10, jti: 'messages-auth-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        findByPkSpy.mockRestore();
        revokedSpy.mockRestore();
    });

    it('returns 401 for unauthenticated requests', async () => {
        const res = await request(app).get('/v1/messages?companyId=1');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Please authenticate');
    });

    it('lists messages for a company', async () => {
        messageService.getMessages.mockResolvedValue({
            items: [{ id: 1, content: 'Hi' }],
            pagination: { page: 1, totalPages: 1, totalItems: 1 }
        });

        const res = await request(app)
            .get('/v1/messages?companyId=1&limit=20')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.messages).toEqual([{ id: 1, content: 'Hi' }]);
        expect(messageService.getMessages).toHaveBeenCalledWith(
            expect.objectContaining({
                companyId: '1',
                limit: '20',
                offset: undefined,
            })
        );
    });

    it('creates a message', async () => {
        messageService.createMessage.mockResolvedValue({
            id: 2,
            companyId: 1,
            content: 'Hello there',
            senderUserId: 10,
        });

        const res = await request(app)
            .post('/v1/messages')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ companyId: 1, content: 'Hello there' });

        expect(res.status).toBe(201);
        expect(res.body.message).toEqual({
            id: 2,
            companyId: 1,
            content: 'Hello there',
            senderUserId: 10,
        });
        expect(messageService.createMessage).toHaveBeenCalledWith({ companyId: 1, content: 'Hello there' }, expect.any(Object));
        expect(emitToCompanyRoom).toHaveBeenCalledWith(
            1,
            'messages:created',
            expect.objectContaining({
                message: expect.objectContaining({ id: 2, companyId: 1 }),
            })
        );
    });

    it('updates message status', async () => {
        messageService.updateMessageStatus.mockResolvedValue({ id: 4, companyId: 1, status: 'read' });

        const res = await request(app)
            .patch('/v1/messages/4/status')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ status: 'read' });

        expect(res.status).toBe(200);
        expect(res.body.message).toEqual({ id: 4, companyId: 1, status: 'read' });
        expect(messageService.updateMessageStatus).toHaveBeenCalledWith('4', 'read', expect.any(Object));
        expect(emitToCompanyRoom).toHaveBeenCalledWith(
            1,
            'messages:status-updated',
            expect.objectContaining({
                message: expect.objectContaining({ id: 4, status: 'read' }),
            })
        );
    });
});
