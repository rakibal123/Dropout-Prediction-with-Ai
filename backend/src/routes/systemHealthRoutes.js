const express = require('express');
const router = express.Router();
const systemHealthController = require('../controllers/systemHealthController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(verifyToken);
router.use(authorizeRoles('admin'));

router.get('/', systemHealthController.getSystemHealth);

module.exports = router;
