const User = require("../models/userModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Add item to cart
exports.addToCart = async (req, res) => {
  const { contactnumber, productid, quantity = 1 } = req.body;
  try {
    const user = await User.findOne({ contactnumber });
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = user.cart.find((item) => item.productid.toString() === productid);
    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ productid, quantity });
    }

    await user.save();
    res.status(200).json({ message: "Product added to cart!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// View cart and calculate total with discount
exports.viewCart = async (req, res) => {
  try {
    const user = await User.findOne({ contactnumber: req.params.contactnumber })
      .populate({
        path: "cart.productid",
        select: "productname sellers filenames discount", // Fetch necessary fields
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    let total = 0;
    user.cart.forEach((item) => {
      const price = item.productid.sellers && item.productid.sellers.length > 0 ? item.productid.sellers[0].price : 0;
      const discount = item.productid.discount || 0;
      const discountedPrice = price - (price * discount) / 100;
      total += discountedPrice * item.quantity;
    });

    res.json({ cart: user.cart, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// Update cart quantity (Increment/Decrement)
exports.updateCartQuantity = async (req, res) => {
  const { contactnumber, productid, quantity } = req.body;

  console.log("Received data in backend:", req.body);

  try {
    // Validate the productid to be a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productid)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find the user and populate cart with the actual product details
    const user = await User.findOne({ contactnumber }).populate({
      path: 'cart.productid',  // Populate the productid with the actual product document
      select: 'productname sellers filenames discount' // Select the fields you want from the product
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("User Cart:", user.cart);

    // Convert the productid from string to ObjectId for correct comparison
    const productIdObject = new mongoose.Types.ObjectId(productid);

    // Find the cart item by matching the productid (using ObjectId conversion)
    const cartItem = user.cart.find(
      (item) => item.productid._id.toString() === productIdObject.toString()
    );

    console.log("Found Cart Item:", cartItem);

    if (!cartItem) return res.status(404).json({ message: "Item not in cart" });

    // Find the product in the products collection
    const product = await Product.findById(productid);
    if (!product) {
      console.log("Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    const maxStock = product.sellers[0]?.stock || 1;

    // Update the quantity while ensuring it does not exceed the available stock
    cartItem.quantity = Math.min(quantity, maxStock);

    await user.save();

    // Return the updated cart and total
    let total = 0;
    let totalWithDiscount = 0;
    user.cart.forEach((item) => {
      const price = item.productid.sellers && item.productid.sellers.length > 0 ? item.productid.sellers[0].price : 0;
      const discount = item.productid.discount || 0;
      const discountedPrice = price - (price * discount) / 100;
      total += price * item.quantity;
      totalWithDiscount += discountedPrice * item.quantity;
    });

    res.status(200).json({
      message: "Cart updated",
      cart: user.cart,
      total,
      totalWithDiscount,
    });
  } catch (err) {
    console.error("Error updating cart quantity:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { contactnumber, productid } = req.body;
  try {
    const user = await User.findOne({ contactnumber });
    user.cart = user.cart.filter((item) => item.productid.toString() !== productid);
    await user.save();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
