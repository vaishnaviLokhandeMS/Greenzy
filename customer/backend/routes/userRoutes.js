const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");

const router = express.Router();

// ✅ Register Route (Check spelling!)
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
