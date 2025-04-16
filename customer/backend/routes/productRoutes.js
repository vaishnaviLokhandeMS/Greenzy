const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { addProduct } = require("../controllers/productController");
const Product = require("../models/productModel");

// 🔢 STEP 1: Generate product number before multer starts
const generateProductNumber = async () => {
  let number;
  let exists = true;
  while (exists) {
    number = Math.floor(100000 + Math.random() * 900000).toString();
    const found = await Product.findOne({ productnumber: number });
    if (!found) exists = false;
  }
  return number;
};

// 🔧 Middleware to generate product number before multer
const generateProductNumberMiddleware = async (req, res, next) => {
  req.productnumber = await generateProductNumber();
  next();
};

// 📦 Multer storage: directly store in uploads/{productnumber}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", req.productnumber);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// 🛒 Route: Add Product
router.post(
  "/add",
  generateProductNumberMiddleware,
  upload.array("images", 5),
  (req, res) => {
    req.filenames = req.files.map(file =>
      path.join(req.productnumber, file.originalname)
    );
    addProduct(req, res);
  }
);

// // ✅ Add this route to support query params
// router.get("/", async (req, res) => {
//   try {
//     const { category, subcategory } = req.query;
//     const products = await Product.find({
//       categoryid: category,
//       subcategoryid: subcategory,
//     });
//     res.status(200).json(products); // return array directly
//   } catch (err) {
//     console.error("❌ Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// GET all products by category and subcategory (e.g. for grid view)
router.get("/by-category", async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    const products = await Product.find({
      categoryid: category,
      subcategoryid: subcategory,
    });
    res.status(200).json(products); // return array directly
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single product by ID (for product detail page)
// For product view route
router.get("/by-id/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Fix image filenames to use forward slashes
    product.filenames = product.filenames.map(file => 
      file.replace(/\\/g, "/") // Replace all backslashes with forward slashes
    );

    res.status(200).json(product); // Return the product with fixed filenames
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
