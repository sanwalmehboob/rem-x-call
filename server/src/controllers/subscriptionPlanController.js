const catchAsync = require('../utils/catchAsync');
const subscriptionPlanService = require('../services/subscriptionPlanService');

const listPlans = catchAsync(async (req, res) => {
    const activeOnly = req.query.activeOnly === 'true' || req.query.activeOnly === '1';
    const result = await subscriptionPlanService.listPlans({
        activeOnly,
        page: req.query.page,
        pageSize: req.query.pageSize,
        q: req.query.q || '',
    });
    res.send({ plans: result.items, pagination: result.pagination });
});

const createPlan = catchAsync(async (req, res) => {
    const plan = await subscriptionPlanService.createPlan(req.body);
    res.status(201).send({ plan });
});

const updatePlan = catchAsync(async (req, res) => {
    const plan = await subscriptionPlanService.updatePlan(req.params.planId, req.body);
    res.send({ plan });
});

const deletePlan = catchAsync(async (req, res) => {
    await subscriptionPlanService.deletePlan(req.params.planId);
    res.status(204).send();
});

module.exports = {
    listPlans,
    createPlan,
    updatePlan,
    deletePlan,
};
