const express = require('express');
const router = express.Router();
const { initRewardSystem, completeRewardSystem ,getAllRewardSystems  } = require('../controllers/Points&RewardsController');

// If you have authentication middleware, add it here
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, initRewardSystem, completeRewardSystem);
 // without auth for now
router.post('/init', authMiddleware, initRewardSystem);
router.post('/complete',authMiddleware, completeRewardSystem); 
router.get('/', getAllRewardSystems);

module.exports = router;