const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const pincodeRoutes = require("./routes/pincodeRoutes");
const feeRoutes = require("./routes/feeRoutes");
const shiprocketRoutes = require("./routes/shiprocketRoutes");
const orderRoutes = require('./routes/orderRoutes');


dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Serve images from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/pincode", pincodeRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/shiprocket", shiprocketRoutes);
app.use("/api/orders", orderRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Greenzy Customer API is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
