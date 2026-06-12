const { User } = require('../../src/models');
const userService = require('../../src/services/userService');
const ApiError = require('../../src/utils/ApiError');

// Mock Sequelize Model
jest.mock('../../src/models', () => ({
    User: {
        create: jest.fn(),
        findOne: jest.fn(),
    },
}));

describe('User Service', () => {
    let newUser;

    beforeEach(() => {
        jest.clearAllMocks();
        newUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        };
    });

    describe('createUser', () => {
        it('should create a user when data is valid', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(newUser);

            const result = await userService.createUser(newUser);
            expect(result).toEqual(newUser);
            expect(User.create).toHaveBeenCalledWith(newUser);
        });

        it('should throw an error if email is already taken', async () => {
            User.findOne.mockResolvedValue({ email: newUser.email });

            await expect(userService.createUser(newUser)).rejects.toThrow(ApiError);
            await expect(userService.createUser(newUser)).rejects.toThrow('Email already taken');
        });
    });
});
