const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const contactService = require('../../src/services/contactService');
const { User, RevokedToken } = require('../../src/models');

jest.mock('../../src/services/contactService');

describe('Contacts routes', () => {
    let findByPkSpy;
    let revokedSpy;
    let authToken;

    beforeEach(() => {
        jest.clearAllMocks();

        findByPkSpy = jest.spyOn(User, 'findByPk').mockResolvedValue({
            id: 10,
            isActive: true,
            toJSON: () => ({ id: 10, email: 'agent@example.com' }),
        });
        revokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);
        authToken = jwt.sign({ sub: 10, jti: 'contacts-auth-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        findByPkSpy.mockRestore();
        revokedSpy.mockRestore();
    });

    it('returns 401 for unauthenticated requests', async () => {
        const res = await request(app).get('/v1/contacts');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Please authenticate');
    });

    it('lists contacts for authenticated requests', async () => {
        contactService.getContacts.mockResolvedValue({
            items: [{ id: 1, fullName: 'Christina' }],
            pagination: { page: 1, totalPages: 1, totalItems: 1 }
        });

        const res = await request(app)
            .get('/v1/contacts?tab=unassigned')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.contacts).toEqual([{ id: 1, fullName: 'Christina' }]);
        expect(contactService.getContacts).toHaveBeenCalledWith(
            expect.objectContaining({
                tab: 'unassigned',
                search: '',
            })
        );
    });

    it('creates contact', async () => {
        contactService.createContact.mockResolvedValue({ id: 2, fullName: 'John' });

        const res = await request(app)
            .post('/v1/contacts')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ fullName: 'John', phone: '123', companyName: 'Acme' });

        expect(res.status).toBe(201);
        expect(res.body.contact).toEqual({ id: 2, fullName: 'John' });
    });

    it('returns assignable agents list', async () => {
        contactService.getAssignableAgents.mockResolvedValue({
            items: [{ id: 10, username: 'agent' }],
            pagination: { page: 1, totalPages: 1, totalItems: 1 }
        });

        const res = await request(app)
            .get('/v1/contacts/agents')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.agents).toEqual([{ id: 10, username: 'agent' }]);
    });

    it('assigns contact to agent', async () => {
        contactService.assignContact.mockResolvedValue({ id: 5, assignedAgentId: 10 });

        const res = await request(app)
            .post('/v1/contacts/5/assign')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ agentUserId: 10 });

        expect(res.status).toBe(200);
        expect(contactService.assignContact).toHaveBeenCalledWith('5', 10);
    });

    it('unassigns contact from agent', async () => {
        contactService.unassignContact.mockResolvedValue({ id: 5, assignedAgentId: null });

        const res = await request(app)
            .post('/v1/contacts/5/unassign')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(contactService.unassignContact).toHaveBeenCalledWith('5');
    });

    it('deletes contact', async () => {
        contactService.deleteContact.mockResolvedValue();

        const res = await request(app)
            .delete('/v1/contacts/5')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(204);
        expect(contactService.deleteContact).toHaveBeenCalledWith('5');
    });
});
