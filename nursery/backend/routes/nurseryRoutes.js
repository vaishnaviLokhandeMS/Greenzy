const express = require('express');
const { registerNurseryOwner, loginNurseryOwner } = require('../controllers/nurseryController');

const router = express.Router();

router.post('/signup', registerNurseryOwner);
router.post('/login', loginNurseryOwner);

module.exports = router;
