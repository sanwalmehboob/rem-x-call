const { User } = require('../models');
const ApiError = require('../utils/ApiError');

const trim = (value) => (typeof value === 'string' ? value.trim() : '');

const optionalString = (value, maxLen) => {
    const s = trim(value);
    if (!s) return null;
    return s.slice(0, maxLen);
};

const normalizeEmail = (email) => trim(email).toLowerCase();

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    const email = normalizeEmail(userBody.email);
    const username = trim(userBody.username);
    if (!email) {
        throw new ApiError(400, 'Email is required');
    }
    if (!username) {
        throw new ApiError(400, 'Username is required');
    }
    if (await User.findOne({ where: { email } })) {
        throw new ApiError(400, 'Email already taken');
    }
    if (await User.findOne({ where: { username } })) {
        throw new ApiError(400, 'Username already taken');
    }
    return User.create({
        ...userBody,
        email,
        username,
    });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return User.findOne({ where: { email: normalizeEmail(email) } });
};

/**
 * Login with username/email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(401, 'Incorrect email or password');
    }
    return user;
};

/** Update the authenticated user's profile (and optionally password). */
const updateMyProfile = async (user, body) => {
    const updates = {};

    if (body.firstName !== undefined) {
        updates.firstName = optionalString(body.firstName, 64);
    }
    if (body.lastName !== undefined) {
        updates.lastName = optionalString(body.lastName, 64);
    }
    if (body.phone !== undefined) {
        updates.phone = optionalString(body.phone, 32);
    }
    if (body.sipExtension !== undefined) {
        updates.sipExtension = optionalString(body.sipExtension, 32);
    }

    if (body.email !== undefined) {
        const nextEmail = normalizeEmail(body.email);
        if (!nextEmail) {
            throw new ApiError(400, 'Email is required');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
            throw new ApiError(400, 'Invalid email');
        }
        if (nextEmail !== String(user.email || '').toLowerCase()) {
            const taken = await User.findOne({ where: { email: nextEmail } });
            if (taken) {
                throw new ApiError(400, 'Email already in use');
            }
            updates.email = nextEmail;
        }
    }

    if (body.username !== undefined) {
        const nextUsername = trim(body.username);
        if (!nextUsername) {
            throw new ApiError(400, 'Username is required');
        }
        if (nextUsername !== user.username) {
            const taken = await User.findOne({ where: { username: nextUsername } });
            if (taken) {
                throw new ApiError(400, 'Username already taken');
            }
            updates.username = nextUsername;
        }
    }

    if (body.profileImageUrl !== undefined) {
        const url = trim(body.profileImageUrl);
        updates.profileImageUrl = url ? url.slice(0, 2048) : null;
    }

    const newPassword = body.newPassword != null ? String(body.newPassword) : '';
    const currentPassword = body.currentPassword != null ? String(body.currentPassword) : '';
    if (newPassword) {
        if (newPassword.length < 8 || newPassword.length > 100) {
            throw new ApiError(400, 'New password must be between 8 and 100 characters');
        }
        if (currentPassword && !(await user.isPasswordMatch(currentPassword))) {
            throw new ApiError(400, 'Current password is incorrect');
        }
        updates.password = newPassword;
    }

    if (Object.keys(updates).length === 0) {
        return user;
    }

    Object.assign(user, updates);
    await user.save();
    return user;
};

module.exports = {
    createUser,
    getUserByEmail,
    loginUserWithEmailAndPassword,
    updateMyProfile,
};
