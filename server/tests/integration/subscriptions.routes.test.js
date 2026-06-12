const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { User, RevokedToken, Company, SubscriptionPlan, SubscriptionHistory } = require('../../src/models');

describe('Subscriptions routes', () => {
    let findUserSpy;
    let findRevokedSpy;
    let findCompanySpy;
    let findHistorySpy;
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
        authToken = jwt.sign({ sub: 10, jti: 'sub-auth-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        findUserSpy.mockRestore();
        findRevokedSpy.mockRestore();
        if (findCompanySpy) findCompanySpy.mockRestore();
        if (findHistorySpy) findHistorySpy.mockRestore();
    });

    it('returns current subscription details with price and period end', async () => {
        const mockPlan = { id: 1, name: 'Pro', priceMonthly: '49.00', billingCycle: 'monthly' };
        const mockCompany = {
            id: 5,
            subscriptionStatus: 'active',
            trialEndsAt: new Date(),
            discountPercent: '10.00',
            subscriptionPlan: mockPlan,
            createdAt: new Date(),
        };

        findCompanySpy = jest.spyOn(Company, 'findByPk').mockResolvedValue(mockCompany);

        const res = await request(app)
            .get('/v1/subscriptions/current')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.planName).toBe('Pro');
        expect(res.body.price).toBe(49.00);
        expect(res.body.currentPeriodEnd).toBeDefined();
    });

    it('returns subscription billing history paginated', async () => {
        const mockHistoryRows = [
            { id: 1, planName: 'Pro', action: 'subscribed', billingCycle: 'monthly', price: '49.00', date: new Date(), status: 'paid' }
        ];

        findHistorySpy = jest.spyOn(SubscriptionHistory, 'findAndCountAll').mockResolvedValue({
            rows: mockHistoryRows,
            count: 1,
        });

        const res = await request(app)
            .get('/v1/subscriptions/history?page=1&pageSize=20')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].planName).toBe('Pro');
        expect(res.body.data[0].price).toBe(49.00);
        expect(res.body.pagination.totalItems).toBe(1);
    });
});
