const admin = require('firebase-admin');
const { sendPushNotification } = require('../../src/utils/firebase');
const { FcmToken } = require('../../src/models');

jest.mock('firebase-admin', () => {
    const mockSend = jest.fn();
    return {
        apps: [],
        initializeApp: jest.fn().mockReturnValue({}),
        credential: {
            cert: jest.fn().mockReturnValue({}),
        },
        messaging: jest.fn().mockReturnValue({
            sendEachForMulticast: mockSend,
        }),
    };
});

jest.mock('../../src/models', () => ({
    FcmToken: {
        destroy: jest.fn(),
    },
}));

describe('firebase utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not send when tokens array is empty', async () => {
        const mockSend = admin.messaging().sendEachForMulticast;
        await sendPushNotification([], { title: 'Test', body: 'Hello' });
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('cleans up invalid registration tokens on failure responses', async () => {
        const mockSend = admin.messaging().sendEachForMulticast;
        
        // Mock response: first token succeeds, second fails with unregistered error
        mockSend.mockResolvedValue({
            successCount: 1,
            failureCount: 1,
            responses: [
                { success: true },
                {
                    success: false,
                    error: {
                        code: 'messaging/registration-token-not-registered',
                        message: 'Registration token is not registered',
                    },
                },
            ],
        });

        await sendPushNotification(['token-good', 'token-bad'], {
            title: 'Multicast Test',
            body: 'Multicast Body',
            data: { testKey: 'testVal' },
        });

        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                notification: { title: 'Multicast Test', body: 'Multicast Body' },
                data: { testKey: 'testVal' },
                tokens: ['token-good', 'token-bad'],
            })
        );

        // Verify FcmToken.destroy was called with the bad token
        expect(FcmToken.destroy).toHaveBeenCalledWith({
            where: { token: ['token-bad'] },
        });
    });
});
