'use strict';

/**
 * Deprecated: onboarding is API-driven (subscription plans → create company → agent invite email).
 * Do not rely on this seeder. Use POST /v1/auth/bootstrap-first-admin with SETUP_SECRET, then
 * create plans via /v1/subscription-plans and companies via /v1/companies.
 */
module.exports = {
    async up() {
        // intentionally empty
    },

    async down() {
        // intentionally empty
    },
};
