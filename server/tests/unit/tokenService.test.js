const jwt = require('jsonwebtoken');
const tokenService = require('../../src/services/tokenService');
const { RevokedToken } = require('../../src/models');
const ApiError = require('../../src/utils/ApiError');

jest.mock('../../src/models', () => ({
    RevokedToken: {
        findOrCreate: jest.fn(),
    },
}));

describe('tokenService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('generates a signed JWT with sub and jti', () => {
            const token = tokenService.generateToken(123, { secret: 'unit-secret', expiresIn: '1h' });
            const payload = jwt.verify(token, 'unit-secret');

            expect(payload.sub).toBe(123);
            expect(typeof payload.jti).toBe('string');
            expect(payload.jti.length).toBeGreaterThan(8);
        });
    });

    describe('revokeTokenByPayload', () => {
        it('throws ApiError when jti/exp are missing', async () => {
            await expect(tokenService.revokeTokenByPayload({ sub: 1 })).rejects.toBeInstanceOf(ApiError);
            await expect(tokenService.revokeTokenByPayload({ sub: 1 })).rejects.toThrow('Invalid token payload');
        });

        it('persists revoked jti with expiry', async () => {
            RevokedToken.findOrCreate.mockResolvedValue([{}, true]);
            const exp = Math.floor(Date.now() / 1000) + 3600;

            await tokenService.revokeTokenByPayload({ sub: 1, jti: 'abc-123', exp });

            expect(RevokedToken.findOrCreate).toHaveBeenCalledWith({
                where: { jti: 'abc-123' },
                defaults: {
                    jti: 'abc-123',
                    expiresAt: new Date(exp * 1000),
                },
            });
        });
    });
});
