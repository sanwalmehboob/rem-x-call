const request = require('supertest');
const jwt = require('jsonwebtoken');
const http = require('http');
const app = require('../../src/app');
const { User, RevokedToken, Contact, CallLog } = require('../../src/models');

describe('Calls routes', () => {
    let findUserSpy;
    let findRevokedSpy;
    let findContactSpy;
    let createCallLogSpy;
    let httpGetSpy;
    let authToken;

    beforeEach(() => {
        jest.clearAllMocks();

        findUserSpy = jest.spyOn(User, 'findByPk').mockResolvedValue({
            id: 10,
            companyId: 5,
            role: 'user',
            isActive: true,
            sipExtension: '1001',
            toJSON: () => ({ id: 10, companyId: 5, role: 'user', sipExtension: '1001' }),
        });
        findRevokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);
        authToken = jwt.sign({ sub: 10, jti: 'sub-auth-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Mock native http.get
        httpGetSpy = jest.spyOn(http, 'get').mockImplementation((url, callback) => {
            const mockResponse = {
                on: (event, handler) => {
                    if (event === 'data') {
                        handler('Originated successfully');
                    }
                    if (event === 'end') {
                        handler();
                    }
                    return mockResponse;
                }
            };
            callback(mockResponse);
            return {
                on: (event, handler) => {
                    return this;
                }
            };
        });
    });

    afterEach(() => {
        findUserSpy.mockRestore();
        findRevokedSpy.mockRestore();
        httpGetSpy.mockRestore();
        if (findContactSpy) findContactSpy.mockRestore();
        if (createCallLogSpy) createCallLogSpy.mockRestore();
    });

    it('originates a call successfully via contactId', async () => {
        findContactSpy = jest.spyOn(Contact, 'findByPk').mockResolvedValue({
            id: 11,
            fullName: 'John Doe',
            phone: '+15556667777',
        });

        createCallLogSpy = jest.spyOn(CallLog, 'create').mockResolvedValue({
            id: 100,
            contactId: 11,
            agentUserId: 10,
            startedAt: new Date(),
            status: 'in_progress',
        });

        const res = await request(app)
            .post('/v1/calls/initiate')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ contactId: 11 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.callId).toBe(100);
        expect(res.body.voipResponse).toBe('Originated successfully');
        expect(httpGetSpy).toHaveBeenCalled();
        expect(httpGetSpy.mock.calls[0][0]).toContain('callerid=1001');
        expect(httpGetSpy.mock.calls[0][0]).toContain('channel=SIP/229224203/15556667777');
        expect(httpGetSpy.mock.calls[0][0]).toContain('exten=15556667777');
    });

    it('originates a call successfully using manual phoneNumber and custom sipExtension', async () => {
        createCallLogSpy = jest.spyOn(CallLog, 'create').mockResolvedValue({
            id: 101,
            contactId: null,
            agentUserId: 10,
            startedAt: new Date(),
            status: 'in_progress',
        });

        const res = await request(app)
            .post('/v1/calls/initiate')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ phoneNumber: '+1-555-999-8888', sipExtension: '2002' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.callId).toBe(101);
        expect(httpGetSpy).toHaveBeenCalled();
        expect(httpGetSpy.mock.calls[0][0]).toContain('callerid=2002');
        expect(httpGetSpy.mock.calls[0][0]).toContain('channel=SIP/229224203/15559998888');
        expect(httpGetSpy.mock.calls[0][0]).toContain('exten=15559998888');
    });
});
