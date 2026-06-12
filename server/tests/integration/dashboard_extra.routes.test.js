const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { User, RevokedToken, CallLog, Product } = require('../../src/models');

describe('Dashboard Extra routes', () => {
    let findUserSpy;
    let findRevokedSpy;
    let callLogCountSpy;
    let productCountSpy;
    let productSumSpy;
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
        authToken = jwt.sign({ sub: 10, jti: 'dash-extra-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        findUserSpy.mockRestore();
        findRevokedSpy.mockRestore();
        if (callLogCountSpy) callLogCountSpy.mockRestore();
        if (productCountSpy) productCountSpy.mockRestore();
        if (productSumSpy) productSumSpy.mockRestore();
    });

    it('returns stats with percentage changes', async () => {
        // Return 10 calls for current period and 5 calls for previous period
        callLogCountSpy = jest.spyOn(CallLog, 'count')
            .mockResolvedValueOnce(10) // current calls
            .mockResolvedValueOnce(5)  // previous calls
            .mockResolvedValueOnce(2)  // current follow-ups
            .mockResolvedValueOnce(1); // previous follow-ups

        const res = await request(app)
            .get('/v1/dashboard/stats?period=30d')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.totalCalls).toBe(10);
        expect(res.body.totalCallsChangePercent).toBe(100); // (10-5)/5 = 100%
        expect(res.body.followUps).toBe(2);
        expect(res.body.followUpsChangePercent).toBe(100);
    });

    it('returns product overview statistics', async () => {
        productCountSpy = jest.spyOn(Product, 'count')
            .mockResolvedValueOnce(50)  // total
            .mockResolvedValueOnce(10)  // current added
            .mockResolvedValueOnce(5);  // previous added
        productSumSpy = jest.spyOn(Product, 'sum')
            .mockResolvedValueOnce(200) // total sold
            .mockResolvedValueOnce(30)  // current sold added
            .mockResolvedValueOnce(20); // previous sold added

        const res = await request(app)
            .get('/v1/dashboard/product-overview?period=30d')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.totalProducts).toBe(50);
        expect(res.body.totalProductsChangePercent).toBe(100);
        expect(res.body.soldProducts).toBe(200);
        expect(res.body.soldProductsChangePercent).toBe(50);
    });
});
