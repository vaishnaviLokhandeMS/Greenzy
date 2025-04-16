const express = require("express");
const { addCategory, getCategories } = require("../controllers/categoryController");

const router = express.Router();

router.post("/add", addCategory);  // ✅ Use addCategory function
router.get("/", getCategories);  // ✅ GET is working

module.exports = router;
