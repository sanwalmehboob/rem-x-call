const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { User, RevokedToken, Contact, CallLog, ContactFraudFlag, ContactDispute } = require('../../src/models');

describe('Contacts Extra routes', () => {
    let findUserSpy;
    let findRevokedSpy;
    let findContactSpy;
    let callLogCountSpy;
    let callLogFindSpy;
    let authToken;

    beforeEach(() => {
        jest.clearAllMocks();

        findUserSpy = jest.spyOn(User, 'findByPk').mockResolvedValue({
            id: 10,
            companyId: 5,
            role: 'user',
            isActive: true,
            toJSON: () => ({ id: 10, companyId: 5, role: 'user' }),
        });
        findRevokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);
        authToken = jwt.sign({ sub: 10, jti: 'contacts-extra-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        findUserSpy.mockRestore();
        findRevokedSpy.mockRestore();
        if (findContactSpy) findContactSpy.mockRestore();
        if (callLogCountSpy) callLogCountSpy.mockRestore();
        if (callLogFindSpy) callLogFindSpy.mockRestore();
    });

    it('returns contact overview details', async () => {
        findContactSpy = jest.spyOn(Contact, 'findByPk').mockResolvedValue({
            id: 1, fullName: 'John Doe', phone: '123', companyName: 'Acme', followUpDate: new Date()
        });
        callLogCountSpy = jest.spyOn(CallLog, 'count').mockResolvedValue(5);
        callLogFindSpy = jest.spyOn(CallLog, 'findOne').mockResolvedValue({
            startedAt: new Date(), status: 'completed'
        });

        const res = await request(app)
            .get('/v1/contacts/1/overview')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.totalAttempts).toBe(5);
        expect(res.body.contactId).toBe(1);
    });

    it('flags a contact as fraud', async () => {
        findContactSpy = jest.spyOn(Contact, 'findByPk').mockResolvedValue({ id: 1 });
        const createSpy = jest.spyOn(ContactFraudFlag, 'create').mockResolvedValue({
            id: 1, contactId: 1, note: 'Scammer', status: 'pending_review', flaggedAt: new Date()
        });

        const res = await request(app)
            .post('/v1/contacts/1/flag-fraud')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ note: 'Scammer' });

        expect(res.status).toBe(201);
        expect(res.body.note).toBe('Scammer');
        createSpy.mockRestore();
    });

    it('raises a billing dispute', async () => {
        findContactSpy = jest.spyOn(Contact, 'findByPk').mockResolvedValue({ id: 1 });
        const createSpy = jest.spyOn(ContactDispute, 'create').mockResolvedValue({
            id: 1, contactId: 1, disputeType: 'incorrect_billing', description: 'Double charge', status: 'pending_review', createdAt: new Date()
        });

        const res = await request(app)
            .post('/v1/contacts/1/dispute')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ disputeType: 'incorrect_billing', description: 'Double charge' });

        expect(res.status).toBe(201);
        expect(res.body.disputeType).toBe('incorrect_billing');
        createSpy.mockRestore();
    });

    it('returns allowed dispute types', async () => {
        const res = await request(app)
            .get('/v1/contacts/dispute-types')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.disputeTypes).toContain('incorrect_billing');
    });
});
