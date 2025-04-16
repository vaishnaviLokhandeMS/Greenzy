const Category = require("../models/categoryModel");

// Add a new category
const addCategory = async (req, res) => {
  try {
    const { categoryname, subcategories } = req.body;

    // Check if the category already exists
    const categoryExists = await Category.findOne({ categoryname });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    // Create a new category
    const newCategory = new Category({ categoryname, subcategories });
    await newCategory.save();

    res.status(201).json({ success: true, message: "Category added successfully", category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getCategories = async (req, res) => {
    try {
      const categories = await Category.find({}, "categoryname"); // Fetch only category names
      res.status(200).json({ categories });
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  

module.exports = { addCategory, getCategories };
