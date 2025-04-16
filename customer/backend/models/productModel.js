const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productnumber: {
    type: String,
    unique: true,
    required: true,
  },
  productname: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },  
  categoryid: {
    type: String, // Changed from ObjectId to String
    required: true,
  },
  subcategoryid: {
    type: String, // Changed from ObjectId to String
    required: true,
  },
  sellers: [
    {
      ownerid: {
        type: String, // Changed from ObjectId to String
        required: true,
      },
      nurseryname: String,
      price: Number,
      stock: Number,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      addedat: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  description: String,
  specifications: {
    watering: String,
    sunlight: String,
    height: String,
    potmaterial: String,
    fertilizer: String,
    maintenance: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      rating: Number,
      comment: String,
      createdat: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  filenames: [String],
  createdat: {
    type: Date,
    default: Date.now,
  },
  updatedat: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("products", productSchema);
module.exports = Product;
