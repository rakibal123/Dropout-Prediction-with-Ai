const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/avatar', profileController.updateAvatar);
router.put('/change-password', profileController.changePassword);
router.get('/sessions', profileController.getSessions);
router.delete('/sessions/logout-all', profileController.logoutAll);
router.delete('/sessions/:sessionId', profileController.deleteSession);
router.put('/preferences', profileController.updatePreferences);

module.exports = router;
