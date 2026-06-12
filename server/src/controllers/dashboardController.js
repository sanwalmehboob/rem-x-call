const catchAsync = require('../utils/catchAsync');
const dashboardService = require('../services/dashboardService');

const getStats = catchAsync(async (req, res) => {
    const stats = await dashboardService.getStats({ period: req.query.period });
    res.send(stats);
});

const getRecentCalls = catchAsync(async (req, res) => {
    const calls = await dashboardService.getRecentCalls({ 
        limit: req.query.limit,
        req,
    });
    res.send({ data: calls, recentCalls: calls });
});

const getFollowUps = catchAsync(async (req, res) => {
    const result = await dashboardService.getFollowUps({ 
        limit: req.query.limit,
        page: req.query.page,
        pageSize: req.query.pageSize,
        req,
    });
    res.send({ 
        totalFollowUps: result.totalFollowUps,
        data: result.data,
        pagination: result.pagination,
    });
});

const getAgentPerformance = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const performanceData = await dashboardService.getAgentPerformance({ page, limit });
    res.send({ agentPerformance: performanceData.items, meta: performanceData.meta });
});

const getProductOverview = catchAsync(async (req, res) => {
    const stats = await dashboardService.getProductOverview({ 
        period: req.query.period,
    });
    res.send(stats);
});

module.exports = {
    getStats,
    getRecentCalls,
    getFollowUps,
    getAgentPerformance,
    getProductOverview,
};
