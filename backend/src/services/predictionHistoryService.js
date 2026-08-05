const PredictionHistory = require('../models/PredictionHistory');

const getStudentPredictionHistory = async (studentId, queryParams) => {
    const { 
        page = 1, 
        limit = 10, 
        search = '', 
        riskLevel = '', 
        sort = 'newest' 
    } = queryParams;

    const query = { studentId };

    if (riskLevel) {
        query.riskLevel = riskLevel;
    }

    if (search) {
        // Simple search logic for riskLevel
        // To search by date, we might need a complex aggregation or just matching strings.
        // For simplicity, we search by riskLevel or predictionMethod
        query.$or = [
            { riskLevel: { $regex: search, $options: 'i' } },
            { predictionMethod: { $regex: search, $options: 'i' } }
        ];
    }

    let sortObj = { createdAt: -1 };
    switch (sort) {
        case 'oldest':
            sortObj = { createdAt: 1 };
            break;
        case 'highest_score':
            sortObj = { finalScore: -1 };
            break;
        case 'lowest_score':
            sortObj = { finalScore: 1 };
            break;
        case 'newest':
        default:
            sortObj = { createdAt: -1 };
            break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const predictions = await PredictionHistory.find(query)
        .populate('behaviorRecordId')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await PredictionHistory.countDocuments(query);

    return {
        predictions,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
    };
};

module.exports = {
    getStudentPredictionHistory
};
