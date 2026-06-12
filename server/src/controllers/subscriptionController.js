const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { Company, SubscriptionPlan, SubscriptionHistory } = require('../models');

/**
 * GET /subscriptions/current
 * Returns the authenticated user's active subscription via their company.
 */
const getCurrentSubscription = catchAsync(async (req, res) => {
    const user = req.user;

    if (!user.companyId) {
        throw new ApiError(404, 'No active subscription found');
    }

    const company = await Company.findByPk(user.companyId, {
        include: [
            {
                model: SubscriptionPlan,
                as: 'subscriptionPlan',
                required: false,
            },
        ],
    });

    if (!company || !company.subscriptionPlan) {
        throw new ApiError(404, 'No active subscription found');
    }

    const plan = company.subscriptionPlan;
    const price = parseFloat(plan.priceMonthly);
    const currentPeriodEnd = company.trialEndsAt 
        ? company.trialEndsAt 
        : new Date(company.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    res.send({
        planId: plan.id,
        planName: plan.name,
        status: company.subscriptionStatus,
        billingCycle: plan.billingCycle,
        trialEndsAt: company.trialEndsAt,
        discountPercent: company.discountPercent,
        price,
        currentPeriodEnd,
        features: {
            dialerEnabled: plan.dialerEnabled,
            chatEnabled: plan.chatEnabled,
            recordingEnabled: plan.recordingEnabled,
            whiteLabelEnabled: plan.whiteLabelEnabled,
        },
    });
});

/**
 * GET /subscriptions/history
 * Returns paginated billing history for the authenticated user's company.
 */
const getSubscriptionHistory = catchAsync(async (req, res) => {
    const user = req.user;

    if (!user.companyId) {
        throw new ApiError(404, 'No billing history found');
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 100);
    const offset = (page - 1) * pageSize;

    const { rows, count } = await SubscriptionHistory.findAndCountAll({
        where: { companyId: user.companyId },
        order: [['date', 'DESC'], ['id', 'DESC']],
        limit: pageSize,
        offset,
    });

    res.send({
        data: rows.map((item) => ({
            id: item.id,
            planName: item.planName,
            action: item.action,
            billingCycle: item.billingCycle,
            price: parseFloat(item.price),
            date: item.date,
            status: item.status,
        })),
        pagination: {
            page,
            pageSize,
            totalItems: count,
            totalPages: Math.max(1, Math.ceil(count / pageSize)),
        },
    });
});

module.exports = {
    getCurrentSubscription,
    getSubscriptionHistory,
};
