const Category = require('../models/categoryModel');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find(); // includes subcategories
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};
