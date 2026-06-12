const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

let firebaseApp = null;

try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        // Initialize using environment variables
        const formattedKey = privateKey.replace(/\\n/g, '\n');
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });
        logger.info('[Firebase] Firebase Admin SDK initialized successfully using environment variables.');
    } else {
        // Fallback to JSON file approach
        const saPath = config.get('firebase.serviceAccountPath');
        const absolutePath = path.resolve(__dirname, '..', '..', saPath);

        if (fs.existsSync(absolutePath)) {
            const serviceAccount = require(absolutePath);
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            logger.info('[Firebase] Firebase Admin SDK initialized successfully using config JSON file.');
        } else {
            logger.warn(`[Firebase] Credentials not found in env or file at ${absolutePath}. Push notifications disabled.`);
        }
    }
} catch (error) {
    logger.error('[Firebase] Error initializing Firebase Admin SDK:', error);
}

/**
 * Sends a multicast push notification to multiple device tokens via FCM.
 * Automatically cleans up invalid or unregistered tokens from the database.
 * 
 * @param {string[]} tokens - Array of FCM device registration tokens
 * @param {Object} payload - Push notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} [payload.data] - Key-value pair data payload (values must be strings)
 */
const sendPushNotification = async (tokens, { title, body, data }) => {
    if (!firebaseApp) {
        logger.warn('[Firebase] Cannot send push notification: SDK not initialized.');
        return;
    }

    if (!Array.isArray(tokens) || tokens.length === 0) {
        return;
    }

    // Clean tokens list
    const activeTokens = [...new Set(tokens.filter((t) => typeof t === 'string' && t.trim()))];
    if (activeTokens.length === 0) {
        return;
    }

    // Format data payload: all values must be strings for Firebase Cloud Messaging
    const dataPayload = {};
    if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                dataPayload[key] = String(val);
            }
        });
    }

    const message = {
        notification: { title, body },
        data: dataPayload,
        tokens: activeTokens,
    };

    try {
        logger.info(`[Firebase] Sending multicast push notification to ${activeTokens.length} tokens...`);
        const response = await admin.messaging().sendEachForMulticast(message);
        logger.info(`[Firebase] Push results: ${response.successCount} succeeded, ${response.failureCount} failed.`);

        if (response.failureCount > 0) {
            const tokensToRemove = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    const errorCode = error?.code;
                    // Check if token is invalid or no longer registered
                    if (
                        errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered' ||
                        errorCode === 'messaging/invalid-argument'
                    ) {
                        tokensToRemove.push(activeTokens[idx]);
                    } else {
                        logger.warn(`[Firebase] Token fail code ${errorCode}: ${error?.message}`);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                const { FcmToken } = require('../models');
                await FcmToken.destroy({ where: { token: tokensToRemove } });
                logger.info(`[Firebase] Cleaned up ${tokensToRemove.length} inactive or unregistered tokens from database.`);
            }
        }
    } catch (error) {
        logger.error('[Firebase] Error sending multicast message:', error);
    }
};

module.exports = {
    sendPushNotification,
};
