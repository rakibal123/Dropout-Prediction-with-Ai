const analyticsService = require('../services/analyticsService');
const insightService = require('../services/insightService');
const interventionService = require('../services/interventionService');
const asyncHandler = require('../utils/asyncHandler');

const getOverview = asyncHandler(async (req, res) => {
    const departmentFilter = req.user.role === 'teacher' ? req.user.department : null;
    const overview = await analyticsService.getOverview(departmentFilter);
    res.status(200).json({ success: true, data: overview });
});

const getTrends = asyncHandler(async (req, res) => {
    const departmentFilter = req.user.role === 'teacher' ? req.user.department : null;
    const trends = await analyticsService.getTrends(departmentFilter);
    res.status(200).json({ success: true, data: trends });
});

const getInsights = asyncHandler(async (req, res) => {
    const departmentFilter = req.user.role === 'teacher' ? req.user.department : null;
    const overview = await analyticsService.getOverview(departmentFilter);
    const trends = await analyticsService.getTrends(departmentFilter);
    const insights = await insightService.generateInsights(overview, trends);
    res.status(200).json({ success: true, data: insights });
});

const getHighRisk = asyncHandler(async (req, res) => {
    const departmentFilter = req.user.role === 'teacher' ? req.user.department : null;
    const highRiskStudents = await analyticsService.getHighRiskStudents(departmentFilter);
    res.status(200).json({ success: true, data: highRiskStudents });
});

const getDepartments = asyncHandler(async (req, res) => {
    // Usually admin only, but we can return data if requested
    const departmentsRisk = await analyticsService.getDepartmentsRisk();
    res.status(200).json({ success: true, data: departmentsRisk });
});

const createIntervention = asyncHandler(async (req, res) => {
    const data = {
        ...req.body,
        assignedBy: req.user.id
    };
    const intervention = await interventionService.createIntervention(data);
    res.status(201).json({ success: true, data: intervention, message: 'Intervention created successfully' });
});

const getInterventions = asyncHandler(async (req, res) => {
    const departmentFilter = req.user.role === 'teacher' ? req.user.department : null;
    const interventions = await interventionService.getInterventions(departmentFilter);
    res.status(200).json({ success: true, data: interventions });
});

module.exports = {
    getOverview,
    getTrends,
    getInsights,
    getHighRisk,
    getDepartments,
    createIntervention,
    getInterventions
};
