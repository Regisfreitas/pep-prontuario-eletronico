const express = require('express');
const { connectKommo } = require('../controllers/integrationsController');

const router = express.Router();

router.post('/kommo/connect', connectKommo);

module.exports = router;
