const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { Company, User, RevokedToken, SubscriptionPlan } = require('../../src/models');

describe('Company routes - my-branding', () => {
    let mockUser;
    let mockCompany;
    let mockPlan;
    let token;
    let findByPkUserSpy;
    let findByPkCompanySpy;
    let findOneRevokedSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPlan = {
            id: 1,
            name: 'Standard Plan',
            whiteLabelEnabled: false,
        };

        mockCompany = {
            id: 10,
            name: 'Original Name Inc',
            businessEmail: 'original@company.com',
            subscriptionPlanId: 1,
            whiteLabelLogoUrl: null,
            primaryBrandColor: null,
            secondaryBrandColor: null,
            brandFont: null,
            subscriptionPlan: mockPlan,
            save: jest.fn().mockResolvedValue(this),
            toJSON: function () {
                return {
                    id: this.id,
                    name: this.name,
                    businessEmail: this.businessEmail,
                    subscriptionPlanId: this.subscriptionPlanId,
                    whiteLabelLogoUrl: this.whiteLabelLogoUrl,
                    primaryBrandColor: this.primaryBrandColor,
                    secondaryBrandColor: this.secondaryBrandColor,
                    brandFont: this.brandFont,
                    subscriptionPlan: this.subscriptionPlan,
                };
            },
        };

        mockUser = {
            id: 5,
            companyId: 10,
            role: 'user',
            isActive: true,
            toJSON: () => ({ id: 5, companyId: 10, role: 'user' }),
        };

        token = jwt.sign({ sub: 5, jti: 'jti-branding-test' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        findByPkUserSpy = jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser);
        findByPkCompanySpy = jest.spyOn(Company, 'findByPk').mockResolvedValue(mockCompany);
        findOneRevokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);
    });

    afterEach(() => {
        findByPkUserSpy.mockRestore();
        findByPkCompanySpy.mockRestore();
        findOneRevokedSpy.mockRestore();
    });

    describe('GET /v1/companies/my-branding', () => {
        it('returns branding information including companyName and businessEmail', async () => {
            const res = await request(app)
                .get('/v1/companies/my-branding')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.branding).toEqual({
                id: 10,
                name: 'Original Name Inc',
                companyName: 'Original Name Inc',
                businessEmail: 'original@company.com',
                whiteLabelEnabled: false,
                whiteLabelLogoUrl: null,
                primaryBrandColor: '#000000',
                secondaryBrandColor: '#111111',
                brandFont: null,
            });
        });
    });

    describe('PATCH /v1/companies/my-branding', () => {
        it('allows updating companyName and businessEmail even if whiteLabel is false', async () => {
            const res = await request(app)
                .patch('/v1/companies/my-branding')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    companyName: 'Updated Company LLC',
                    businessEmail: 'updated@company.com',
                });

            expect(res.status).toBe(200);
            expect(mockCompany.name).toBe('Updated Company LLC');
            expect(mockCompany.businessEmail).toBe('updated@company.com');
            expect(mockCompany.save).toHaveBeenCalled();
        });

        it('rejects updating whiteLabel fields if plan does not support whiteLabel', async () => {
            const res = await request(app)
                .patch('/v1/companies/my-branding')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    whiteLabelLogoUrl: 'http://newlogo.png',
                });

            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/White-label customization is not enabled/);
        });

        it('allows updating whiteLabel fields if plan supports whiteLabel', async () => {
            mockPlan.whiteLabelEnabled = true;
            const res = await request(app)
                .patch('/v1/companies/my-branding')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    whiteLabelLogoUrl: 'http://newlogo.png',
                    primaryBrandColor: '#aabbcc',
                });

            expect(res.status).toBe(200);
            expect(mockCompany.whiteLabelLogoUrl).toBe('http://newlogo.png');
            expect(mockCompany.primaryBrandColor).toBe('#aabbcc');
            expect(mockCompany.save).toHaveBeenCalled();
        });
    });
});
