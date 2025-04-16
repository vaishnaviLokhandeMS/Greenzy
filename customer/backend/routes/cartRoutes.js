const express = require("express");
const router = express.Router();
const {
  addToCart,
  viewCart,
  updateCartQuantity,
  removeFromCart
} = require("../controllers/cartController");

// Add product to cart
router.post("/add", addToCart);

// View cart
router.get("/view/:contactnumber", viewCart);

// Update quantity
router.put("/update", updateCartQuantity);

// Remove item
router.delete("/remove", removeFromCart);

module.exports = router;
