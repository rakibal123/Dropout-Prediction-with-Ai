const express = require('express');
const router = express.Router();
const predictionExplanationController = require('../controllers/predictionExplanationController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/:id/explanation', predictionExplanationController.getExplanation);
router.get('/:id/charts', predictionExplanationController.getCharts);

module.exports = router;
