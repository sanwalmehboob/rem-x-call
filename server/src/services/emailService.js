const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../utils/logger');

const buildTransport = () => {
    const host = String(config.get('email.smtpHost') || '').trim();
    const user = String(config.get('email.smtpUser') || '').trim();
    const pass = String(config.get('email.smtpPass') || '').trim();
    if (!host || !user || !pass) {
        return null;
    }
    const port = config.get('email.smtpPort');
    const secure = config.get('email.smtpSecure');
    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
};

/**
 * @param {{ to: string; subject: string; text: string; html?: string }} opts
 */
const sendMail = async (opts) => {
    const transport = buildTransport();
    const from = config.get('email.from');

    if (!transport) {
        logger.warn(
            `[email] SMTP not configured — would send to ${opts.to}: ${opts.subject}\n${opts.text.slice(0, 500)}`
        );
        return { skipped: true };
    }

    await transport.sendMail({
        from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html || opts.text.replace(/\n/g, '<br/>'),
    });
    return { skipped: false };
};

const sendAgentInviteEmail = async ({ to, companyName, temporaryPassword, greetingName, agentUsername }) => {
    const hello = String(greetingName || agentUsername || 'there').trim() || 'there';
    const loginUrl = `${config.get('app.publicUrl').replace(/\/$/, '')}/login`;
    const subject = `Your RemXCall access — ${companyName}`;
    const text = [
        `Hello ${hello},`,
        '',
        `An account has been created for you on RemXCall for ${companyName}.`,
        '',
        `Sign in with your email address and the temporary password below.`,
        '',
        `Login URL: ${loginUrl}`,
        `Email (login): ${to}`,
        `Temporary password: ${temporaryPassword}`,
        '',
        'Please sign in and change your password from settings when you can.',
        '',
        '— RemXCall',
    ].join('\n');

    const html = `
      <p>Hello <strong>${escapeHtml(hello)}</strong>,</p>
      <p>An account has been created for you on <strong>RemXCall</strong> for <strong>${escapeHtml(companyName)}</strong>.</p>
      <p><a href="${loginUrl}">Sign in</a></p>
      <p><strong>Email (login):</strong> ${escapeHtml(to)}<br/>
      <strong>Temporary password:</strong> <code>${escapeHtml(temporaryPassword)}</code></p>
      <p>Please sign in and change your password when you can.</p>
      <p>— RemXCall</p>
    `;

    return sendMail({ to, subject, text, html });
};

const sendPasswordResetOtpEmail = async ({ to, otp }) => {
    const subject = 'Your RemXCall password reset code';
    const text = [
        'You asked to reset your RemXCall password.',
        '',
        `Your verification code: ${otp}`,
        '',
        'This code expires in a few minutes. If you did not request this, you can ignore this email.',
        '',
        '— RemXCall',
    ].join('\n');

    const html = `
      <p>You asked to reset your <strong>RemXCall</strong> password.</p>
      <p>Your verification code: <strong style="font-size:1.25em;letter-spacing:0.1em;">${escapeHtml(otp)}</strong></p>
      <p>This code expires in a few minutes. If you did not request this, you can ignore this email.</p>
      <p>— RemXCall</p>
    `;

    return sendMail({ to, subject, text, html });
};

const escapeHtml = (s) =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

module.exports = {
    sendMail,
    sendAgentInviteEmail,
    sendPasswordResetOtpEmail,
};
