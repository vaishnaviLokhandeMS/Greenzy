const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  gstPercentage: {
    type: Number,
    required: true,
  },
  platformFee: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("gstfee", feeSchema, "gstfee");

