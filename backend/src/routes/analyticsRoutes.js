const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(verifyToken);
router.use(authorizeRoles('admin', 'teacher'));

router.get('/overview', analyticsController.getOverview);
router.get('/trends', analyticsController.getTrends);
router.get('/insights', analyticsController.getInsights);
router.get('/high-risk', analyticsController.getHighRisk);
router.get('/departments', analyticsController.getDepartments);

router.post('/interventions', analyticsController.createIntervention);
router.get('/interventions', analyticsController.getInterventions);

module.exports = router;
