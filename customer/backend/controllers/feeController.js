const Fee = require("../models/feeModel");

exports.getLatestFee = async (req, res) => {
  try {
    const fee = await Fee.findOne().sort({ createdAt: -1 });
    if (!fee) {
      return res.status(404).json({ message: "Fee data not found" });
    }
    res.status(200).json(fee);
  } catch (err) {
    console.error("Error fetching gstfee:", err);
    res.status(500).json({ error: "Server error fetching gstfee" });
  }
};
