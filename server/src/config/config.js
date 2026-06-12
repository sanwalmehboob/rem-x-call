const convict = require('convict');
const validator = require('convict-format-with-validator');
const path = require('path');
require('dotenv').config();

// Empty strings in .env (e.g. SMTP_PORT=) override defaults and fail convict's port format.
['PORT', 'DB_PORT', 'SMTP_PORT', 'CORS_ORIGINS'].forEach((key) => {
    const v = process.env[key];
    if (v !== undefined && String(v).trim() === '') {
        delete process.env[key];
    }
});

// Add format validation
convict.addFormats(validator);

const config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV',
    },
    port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 5000,
        env: 'PORT',
    },
    db: {
        host: {
            doc: 'Database host name/IP',
            format: '*',
            default: '127.0.0.1',
            env: 'DB_HOST',
        },
        user: {
            doc: 'Database user',
            format: '*',
            default: 'root',
            env: 'DB_USER',
        },
        password: {
            doc: 'Database password',
            format: '*',
            default: 'password',
            env: 'DB_PASS',
            sensitive: true,
        },
        name: {
            doc: 'Database name',
            format: '*',
            default: 'rem_x_call',
            env: 'DB_NAME',
        },
        port: {
            doc: 'Database port',
            format: 'port',
            default: 3306,
            env: 'DB_PORT',
        },
    },
    jwt: {
        secret: {
            doc: 'JWT secret',
            format: '*',
            default: 'super-secret',
            env: 'JWT_SECRET',
            sensitive: true,
        },
        expiresIn: {
            doc: 'JWT expiration time',
            format: '*',
            default: '1d',
            env: 'JWT_EXPIRES_IN',
        },
        refreshSecret: {
            doc: 'JWT refresh token secret',
            format: '*',
            default: 'super-refresh-secret',
            env: 'JWT_REFRESH_SECRET',
            sensitive: true,
        },
        refreshExpiresIn: {
            doc: 'JWT refresh token expiration time',
            format: '*',
            default: '30d',
            env: 'JWT_REFRESH_EXPIRES_IN',
        },
    },
    app: {
        publicUrl: {
            doc: 'Public URL of the web app (for invite emails)',
            format: String,
            default: 'http://localhost:5173',
            env: 'APP_PUBLIC_URL',
        },
    },
    cors: {
        origins: {
            doc: 'Comma-separated allowed browser origins. Leave unset for staging (reflect any Origin).',
            format: String,
            default: '',
            env: 'CORS_ORIGINS',
        },
    },
    email: {
        from: {
            doc: 'From address for outbound email',
            format: String,
            default: 'RemXCall <info@remxcall.co.za>',
            env: 'EMAIL_FROM',
        },
        smtpHost: {
            doc: 'SMTP host (empty or missing credentials = log only, no send)',
            format: String,
            default: 'smtp.remxcall.co.za',
            env: 'SMTP_HOST',
        },
        smtpPort: {
            doc: 'SMTP port (465 = implicit TLS / SMTPS)',
            format: 'port',
            default: 465,
            env: 'SMTP_PORT',
        },
        smtpSecure: {
            doc: 'Use TLS from connect (required for port 465)',
            format: Boolean,
            default: true,
            env: 'SMTP_SECURE',
        },
        smtpUser: {
            format: String,
            default: 'info@remxcall.co.za',
            env: 'SMTP_USER',
        },
        smtpPass: {
            format: String,
            default: '',
            env: 'SMTP_PASS',
            sensitive: true,
        },
    },
    bootstrap: {
        secret: {
            doc: 'One-time secret to create the first admin when DB has no users',
            format: String,
            default: '',
            env: 'SETUP_SECRET',
            sensitive: true,
        },
    },
    passwordReset: {
        otpExpiresMinutes: {
            doc: 'Lifetime of emailed OTP for forgot-password',
            format: 'nat',
            default: 15,
            env: 'PASSWORD_RESET_OTP_EXPIRES_MIN',
        },
        resetTokenExpiresIn: {
            doc: 'JWT lifetime after OTP verification (used only for the next reset-password call)',
            format: String,
            default: '15m',
            env: 'PASSWORD_RESET_TOKEN_EXPIRES_IN',
        },
    },
    firebase: {
        serviceAccountPath: {
            doc: 'Path to Firebase Service Account JSON key file (relative to server root).',
            format: String,
            default: 'config/remxcall-95563-firebase-adminsdk-fbsvc-92eec073c4.json',
            env: 'FIREBASE_SERVICE_ACCOUNT_PATH',
        },
    },
});

// Perform validation
config.validate({ allowed: 'warn' });

module.exports = config;
