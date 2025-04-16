const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Function to calculate age from DOB
const calculateAge = (dob) => {
  const birthYear = new Date(dob).getFullYear();
  return new Date().getFullYear() - birthYear;
};

const userSchema = new mongoose.Schema({
  contactnumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+91[0-9]{10}$/, "Must be a valid Indian phone number with +91"]
  },
  fullname: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    default: function () {
      return calculateAge(this.dob);
    }
  },
  password: {
    type: String,
    required: true
  },

  // ✅ Cart: Array of product references and quantity
  cart: [
    {
      productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products", 
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ]
});


// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Lowercase collection name
const User = mongoose.model("users", userSchema);
module.exports = User;
