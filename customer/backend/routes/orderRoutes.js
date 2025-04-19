const express = require("express");
const router = express.Router();
const { createBuyNowOrder } = require("../controllers/orderController");

// POST endpoint to place Buy Now order
router.post("/buynow", createBuyNowOrder);

module.exports = router;
