const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', recommendationController.getRecommendations);
router.get('/:id', recommendationController.getRecommendationById);
router.post('/', recommendationController.createRecommendation);
router.put('/:id', recommendationController.updateRecommendation);
router.delete('/:id', recommendationController.deleteRecommendation);

module.exports = router;
