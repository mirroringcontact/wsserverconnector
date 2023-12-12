'use strict';

const express = require('express');

const redirectControllers = require('../controllers/redirect.js');

const router = express.Router();

router.post('/', redirectControllers.checkRedirect);

module.exports = router;
