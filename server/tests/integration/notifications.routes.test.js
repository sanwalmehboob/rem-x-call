const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { User, RevokedToken, FcmToken, Notification, Company } = require('../../src/models');

describe('Notifications routes', () => {
    let findUserSpy;
    let findRevokedSpy;
    let tokenSpy;
    let notifSpy;
    let notifUpdateSpy;
    let notifCountSpy;
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
        authToken = jwt.sign({ sub: 10, jti: 'notif-auth-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        findUserSpy.mockRestore();
        findRevokedSpy.mockRestore();
        if (tokenSpy) tokenSpy.mockRestore();
        if (notifSpy) notifSpy.mockRestore();
        if (notifUpdateSpy) notifUpdateSpy.mockRestore();
        if (notifCountSpy) notifCountSpy.mockRestore();
    });

    it('registers an FCM token', async () => {
        tokenSpy = jest.spyOn(FcmToken, 'findOne').mockResolvedValue(null);
        const createSpy = jest.spyOn(FcmToken, 'create').mockResolvedValue({
            id: 1, userId: 10, token: 'fcm-123', platform: 'android', deviceId: 'dev-1'
        });

        const res = await request(app)
            .post('/v1/notifications/fcm-token')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ token: 'fcm-123', platform: 'android', deviceId: 'dev-1' });

        expect(res.status).toBe(201);
        expect(res.body.token.token).toBe('fcm-123');
        createSpy.mockRestore();
    });

    it('unregisters an FCM token', async () => {
        const destroySpy = jest.spyOn(FcmToken, 'destroy').mockResolvedValue(1);

        const res = await request(app)
            .delete('/v1/notifications/fcm-token')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ token: 'fcm-123' });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Token unregistered');
        destroySpy.mockRestore();
    });

    it('lists notifications and unread count', async () => {
        const mockNotifs = [
            { id: 1, userId: 10, title: 'Alert', body: 'Test', type: 'system', isRead: false, isArchived: false, toJSON: () => ({ id: 1 }) }
        ];
        notifSpy = jest.spyOn(Notification, 'findAndCountAll').mockResolvedValue({
            rows: mockNotifs,
            count: 1
        });
        notifCountSpy = jest.spyOn(Notification, 'count').mockResolvedValue(1);

        const res = await request(app)
            .get('/v1/notifications?filter=all')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.unreadCount).toBe(1);
    });

    it('generates JIT subscription warning if trial is ending within 3 days', async () => {
        findUserSpy.mockRestore();
        findUserSpy = jest.spyOn(User, 'findByPk').mockResolvedValue({
            id: 10,
            companyId: 5,
            role: 'user',
            isActive: true,
            toJSON: () => ({ id: 10, companyId: 5, role: 'user' }),
        });

        const expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const mockCompany = {
            id: 5,
            subscriptionStatus: 'trial',
            trialEndsAt: expiryDate,
            createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        };
        const companySpy = jest.spyOn(Company, 'findByPk').mockResolvedValue(mockCompany);
        const findOneSpy = jest.spyOn(Notification, 'findOne').mockResolvedValue(null);
        const createSpy = jest.spyOn(Notification, 'create').mockResolvedValue({
            id: 99,
            userId: 10,
            title: 'Trial Period Expiring Soon',
            body: 'Your trial...',
            type: 'billing',
            isRead: false,
            isArchived: false,
        });
        const fcmSpy = jest.spyOn(FcmToken, 'findAll').mockResolvedValue([]);

        notifSpy = jest.spyOn(Notification, 'findAndCountAll').mockResolvedValue({
            rows: [],
            count: 0
        });
        notifCountSpy = jest.spyOn(Notification, 'count').mockResolvedValue(0);

        const res = await request(app)
            .get('/v1/notifications?filter=all')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            userId: 10,
            title: 'Trial Period Expiring Soon',
            type: 'billing'
        }));

        companySpy.mockRestore();
        findOneSpy.mockRestore();
        createSpy.mockRestore();
        fcmSpy.mockRestore();
    });

    it('marks a notification as read', async () => {
        const saveMock = jest.fn();
        const mockNotif = { id: 1, userId: 10, isRead: false, save: saveMock };
        notifSpy = jest.spyOn(Notification, 'findOne').mockResolvedValue(mockNotif);

        const res = await request(app)
            .patch('/v1/notifications/1/read')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(mockNotif.isRead).toBe(true);
        expect(saveMock).toHaveBeenCalled();
    });

    it('archives a notification', async () => {
        const saveMock = jest.fn();
        const mockNotif = { id: 1, userId: 10, isArchived: false, save: saveMock };
        notifSpy = jest.spyOn(Notification, 'findOne').mockResolvedValue(mockNotif);

        const res = await request(app)
            .patch('/v1/notifications/1/archive')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(mockNotif.isArchived).toBe(true);
        expect(saveMock).toHaveBeenCalled();
    });

    it('marks all notifications as read', async () => {
        notifUpdateSpy = jest.spyOn(Notification, 'update').mockResolvedValue([5]);

        const res = await request(app)
            .post('/v1/notifications/read-all')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.markedCount).toBe(5);
    });
});
