const express = require("express");
const router = express.Router();
const { getLatestFee } = require("../controllers/feeController");

router.get("/", getLatestFee);

module.exports = router;
