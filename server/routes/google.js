const express = require('express');
const {
  startAuth,
  handleCallback,
  getStatus,
  disconnect,
} = require('../controllers/googleController');

const router = express.Router();

router.get('/auth/:doctor_id', startAuth);
router.get('/callback', handleCallback);
router.get('/status/:doctor_id', getStatus);
router.post('/disconnect/:doctor_id', disconnect);

module.exports = router;
