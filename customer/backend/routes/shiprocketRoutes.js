const express = require("express");
const router = express.Router();
const { getShippingRate } = require("../controllers/shiprocketController");

router.get("/rate", getShippingRate);

module.exports = router;
