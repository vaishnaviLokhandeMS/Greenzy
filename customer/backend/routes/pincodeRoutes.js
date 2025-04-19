const express = require("express");
const router = express.Router();
const { getPincodeDetails } = require("../controllers/pincodeController");

router.get("/details/:pincode", getPincodeDetails);

module.exports = router; // ✅ Don't forget this
