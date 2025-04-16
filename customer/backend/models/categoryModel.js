const mongoose = require("mongoose");

// Define subcategory schema
const subcategorySchema = new mongoose.Schema({
  subcategoryname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  }
}, { _id: false });

// Define category schema
const categorySchema = new mongoose.Schema({
  categoryname: {
    type: String,
    required: true,
    unique: true,
  },
  subcategories: [subcategorySchema],
  createdat: {
    type: Date,
    default: Date.now,
  },
  updatedat: {
    type: Date,
    default: Date.now,
  }
});

// Create a model from the schema
const Category = mongoose.model("categories", categorySchema);

module.exports = Category;
