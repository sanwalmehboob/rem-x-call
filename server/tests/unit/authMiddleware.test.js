const jwt = require('jsonwebtoken');
const { User, RevokedToken } = require('../../src/models');
const { authenticate } = require('../../src/middleware/authMiddleware');
const ApiError = require('../../src/utils/ApiError');

jest.mock('jsonwebtoken');
jest.mock('../../src/models', () => ({
    User: {
        findByPk: jest.fn(),
    },
    RevokedToken: {
        findOne: jest.fn(),
    },
}));

describe('authMiddleware.authenticate', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = { headers: {} };
        res = {};
        next = jest.fn();
        jwt.verify.mockReset();
        User.findByPk.mockReset();
        RevokedToken.findOne.mockReset();
    });

    it('calls next with ApiError when Authorization header is missing', async () => {
        await authenticate(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
        expect(next.mock.calls[0][0].message).toBe('Please authenticate');
    });

    it('calls next with ApiError when scheme is not Bearer', async () => {
        req.headers.authorization = 'Basic xyz';
        await authenticate(req, res, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('calls next with ApiError when token segment is empty', async () => {
        req.headers.authorization = 'Bearer ';
        await authenticate(req, res, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].message).toBe('Please authenticate');
    });

    it('calls next with ApiError when jwt.verify throws', async () => {
        req.headers.authorization = 'Bearer bad';
        jwt.verify.mockImplementation(() => {
            throw new Error('invalid');
        });
        await authenticate(req, res, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].message).toBe('Invalid or expired token');
    });

    it('calls next with ApiError when payload has no sub', async () => {
        req.headers.authorization = 'Bearer tok';
        jwt.verify.mockReturnValue({});
        await authenticate(req, res, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].message).toBe('Invalid token payload');
    });

    it('calls next with ApiError when token has already been revoked', async () => {
        req.headers.authorization = 'Bearer tok';
        jwt.verify.mockReturnValue({ sub: 1, jti: 'revoked-jti' });
        RevokedToken.findOne.mockResolvedValue({ id: 1, jti: 'revoked-jti' });
        await authenticate(req, res, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].message).toBe('Token has been revoked');
    });

    it('calls next with ApiError when user does not exist', async () => {
        req.headers.authorization = 'Bearer tok';
        jwt.verify.mockReturnValue({ sub: 42, jti: 'jti-user-missing' });
        RevokedToken.findOne.mockResolvedValue(null);
        User.findByPk.mockResolvedValue(null);
        await authenticate(req, res, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].message).toBe('User not found');
    });

    it('calls next with ApiError when user is inactive', async () => {
        req.headers.authorization = 'Bearer tok';
        jwt.verify.mockReturnValue({ sub: 1, jti: 'jti-inactive' });
        RevokedToken.findOne.mockResolvedValue(null);
        User.findByPk.mockResolvedValue({ id: 1, isActive: false });
        await authenticate(req, res, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
        expect(next.mock.calls[0][0].message).toBe('Account is disabled');
    });

    it('attaches user and calls next with no error when token and user are valid', async () => {
        req.headers.authorization = 'Bearer good';
        jwt.verify.mockReturnValue({ sub: 7, jti: 'jti-7' });
        const user = {
            id: 7,
            isActive: true,
            toJSON: () => ({ id: 7, email: 'u@example.com' }),
        };
        RevokedToken.findOne.mockResolvedValue(null);
        User.findByPk.mockResolvedValue(user);
        await authenticate(req, res, next);
        expect(req.user).toBe(user);
        expect(req.token).toBe('good');
        expect(req.tokenPayload).toEqual({ sub: 7, jti: 'jti-7' });
        expect(next).toHaveBeenCalledWith();
    });
});
