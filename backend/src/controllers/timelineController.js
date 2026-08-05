const timelineService = require('../services/timelineService');
const asyncHandler = require('../utils/asyncHandler');

const getStudentTimeline = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const data = await timelineService.getStudentTimeline(req.user.id, page, limit);
    
    res.status(200).json({
        success: true,
        data: data.events,
        stats: data.stats,
        pagination: data.pagination
    });
});

module.exports = {
    getStudentTimeline
};
