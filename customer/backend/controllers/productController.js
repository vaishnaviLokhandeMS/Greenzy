const Product = require("../models/productModel");
const fs = require("fs");
const path = require("path"); // ✅ Make sure this was missing!

// Function to generate 6-digit unique product number (not used here anymore)
const generateProductNumber = async () => {
  let number;
  let exists = true;

  while (exists) {
    number = Math.floor(100000 + Math.random() * 900000).toString();
    const product = await Product.findOne({ productnumber: number });
    if (!product) exists = false;
  }

  return number;
};

exports.addProduct = async (req, res) => {
  try {
    const {
      productname,
      description,
      watering,
      sunlight,
      height,
      potmaterial,
      fertilizer,
      maintenance,
      price,
      stock,
      nurseryname,
    } = req.body;

    // Convert frontend fields to DB fields
    const categoryid = req.body.categoryname;
    const subcategoryid = req.body.subcategoryname;
    const ownerid = req.body.email;

    // This productnumber comes from route middleware
    const productnumber = req.productnumber;

    // Store filenames
    const filenames = req.filenames || [];

    // Save product to DB
    const newProduct = new Product({
      productnumber,
      productname,
      categoryid,
      subcategoryid,
      description,
      specifications: {
        watering,
        sunlight,
        height,
        potmaterial,
        fertilizer,
        maintenance,
      },
      sellers: [
        {
          ownerid,
          nurseryname,
          price,
          stock,
          status: "pending",
        },
      ],
      filenames,
    });

    await newProduct.save();
    res.status(201).json({ message: "✅ Product added successfully", productnumber });
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
