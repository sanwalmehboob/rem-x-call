const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const userService = require('../../src/services/userService');
const tokenService = require('../../src/services/tokenService');
const { User, RevokedToken } = require('../../src/models');
const ApiError = require('../../src/utils/ApiError');

jest.mock('../../src/services/userService');
jest.mock('../../src/services/tokenService');

describe('Auth routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /v1/auth/login', () => {
        it('returns 200 with user and tokens when credentials are valid', async () => {
            const fakeUser = {
                id: 1,
                email: 'a@example.com',
                toJSON: () => ({ id: 1, email: 'a@example.com' }),
            };
            userService.loginUserWithEmailAndPassword.mockResolvedValue(fakeUser);
            const findByPkSpy = jest.spyOn(User, 'findByPk').mockResolvedValue(fakeUser);
            tokenService.generateAuthTokens.mockResolvedValue({
                access: { token: 'signed-jwt', expires: '1d' },
            });

            const res = await request(app).post('/v1/auth/login').send({
                email: 'a@example.com',
                password: 'secret123',
            });

            expect(res.status).toBe(200);
            expect(res.body.tokens.access.token).toBe('signed-jwt');
            expect(userService.loginUserWithEmailAndPassword).toHaveBeenCalledWith('a@example.com', 'secret123');
            expect(User.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({ include: expect.any(Array) }));
            expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(
                fakeUser,
                expect.objectContaining({
                    ipAddress: expect.any(String),
                })
            );
            findByPkSpy.mockRestore();
        });

        it('returns 401 JSON with message when credentials are invalid', async () => {
            userService.loginUserWithEmailAndPassword.mockRejectedValue(
                new ApiError(401, 'Incorrect email or password')
            );

            const res = await request(app).post('/v1/auth/login').send({
                email: 'wrong@example.com',
                password: 'password12',
            });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Incorrect email or password');
            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    describe('POST /v1/auth/register', () => {
        it('returns 201 with user and tokens when registration succeeds', async () => {
            const created = {
                id: 2,
                email: 'new@example.com',
                toJSON: () => ({ id: 2, email: 'new@example.com' }),
            };
            userService.createUser.mockResolvedValue(created);
            tokenService.generateAuthTokens.mockResolvedValue({
                access: { token: 'jwt-new', expires: '1d' },
            });

            const res = await request(app).post('/v1/auth/register').send({
                username: 'newuser',
                email: 'new@example.com',
                password: 'password12',
            });

            expect(res.status).toBe(201);
            expect(res.body.tokens.access.token).toBe('jwt-new');
            expect(userService.createUser).toHaveBeenCalled();
        });
    });

    describe('GET /v1/auth/me', () => {
        it('returns 401 without Authorization header', async () => {
            const res = await request(app).get('/v1/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Please authenticate');
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('returns current user when Bearer token is valid', async () => {
            const userInstance = {
                id: 5,
                isActive: true,
                toJSON: () => ({ id: 5, email: 'me@example.com', username: 'me' }),
            };
            const findByPkSpy = jest.spyOn(User, 'findByPk').mockResolvedValue(userInstance);
            const revokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);

            const token = jwt.sign({ sub: 5, jti: 'jti-auth-me' }, process.env.JWT_SECRET, { expiresIn: '1h' });

            const res = await request(app).get('/v1/auth/me').set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.user).toEqual({
                id: 5,
                email: 'me@example.com',
                username: 'me',
            });
            expect(User.findByPk).toHaveBeenCalledWith(5, expect.objectContaining({ include: expect.any(Array) }));

            findByPkSpy.mockRestore();
            revokedSpy.mockRestore();
        });
    });

    describe('POST /v1/auth/refresh-tokens', () => {
        it('returns 200 with rotated tokens', async () => {
            tokenService.refreshAuth.mockResolvedValue({
                access: { token: 'new-access', expires: '1d' },
                refresh: { token: 'new-refresh', expires: '30d' },
                session: { sid: 'session-1' },
            });

            const res = await request(app).post('/v1/auth/refresh-tokens').send({
                refreshToken: 'refresh-token-1',
                clientType: 'mobile',
            });

            expect(res.status).toBe(200);
            expect(res.body.tokens.access.token).toBe('new-access');
            expect(tokenService.refreshAuth).toHaveBeenCalledWith(
                'refresh-token-1',
                expect.objectContaining({
                    clientType: 'mobile',
                    ipAddress: expect.any(String),
                })
            );
        });
    });

    describe('POST /v1/auth/logout', () => {
        it('returns 401 without Authorization header', async () => {
            const res = await request(app).post('/v1/auth/logout');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Please authenticate');
        });

        it('revokes the current token and returns 204', async () => {
            const userInstance = {
                id: 6,
                isActive: true,
                toJSON: () => ({ id: 6, email: 'me@example.com', username: 'me' }),
            };

            const findByPkSpy = jest.spyOn(User, 'findByPk').mockResolvedValue(userInstance);
            const revokedSpy = jest.spyOn(RevokedToken, 'findOne').mockResolvedValue(null);
            tokenService.revokeTokenByPayload.mockResolvedValue();

            const token = jwt.sign({ sub: 6, jti: 'logout-jti' }, process.env.JWT_SECRET, { expiresIn: '1h' });

            const res = await request(app)
                .post('/v1/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(204);
            expect(tokenService.revokeTokenByPayload).toHaveBeenCalledWith(
                expect.objectContaining({ sub: 6, jti: 'logout-jti' })
            );

            findByPkSpy.mockRestore();
            revokedSpy.mockRestore();
        });
    });
});
