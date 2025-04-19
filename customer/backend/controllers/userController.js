const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// ✅ Login User
const loginUser = async (req, res) => {
  console.log("✅ Login API Hit!");

  try {
    const { contactnumber, password } = req.body;
    console.log("🔹 Received Data:", req.body);

    // 🔍 Check if user exists
    const user = await User.findOne({ contactnumber });

    if (!user) {
      console.log("❌ User Not Found!");
      return res.status(400).json({ success: false, message: "User not found" });
    }

    console.log("🔍 Stored Hashed Password in DB:", user.password);

    // 🔑 Ensure password is hashed before comparing
    if (!user.password.startsWith("$2b$")) {
      console.log("❌ ERROR: Stored Password is NOT Hashed!");
      return res.status(500).json({ success: false, message: "Password stored incorrectly in DB" });
    }

    // 🔑 Compare input password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Incorrect Password! (Bcrypt comparison failed)");
      return res.status(400).json({ success: false, message: "Incorrect Password" });
    }

    console.log("✅ Login Successful for:", user.fullname);
    res.status(200).json({
      success: true,
      message: "Login successful",
      userId: user._id,
      email: user.email || "guest@greenzy.in",
      fullname: user.fullname || "",
    });
    

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const registerUser = async (req, res) => {
  console.log("✅ Signup API Hit!");

  try {
    const { contactnumber, fullname, dob, address, password } = req.body;
    console.log("🔹 Received Data:", req.body);

    // 🔍 Check if user already exists
    const userExists = await User.findOne({ contactnumber });
    if (userExists) {
      console.log("🔸 User Already Exists!");
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 🛠️ Create new user (password will be hashed in userModel.js)
    const user = new User({ contactnumber, fullname, dob, address, password });

    await user.save();

    console.log("✅ User Created Successfully:", user);
    res.status(201).json({ success: true, message: "User registered successfully", userId: user._id });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = { loginUser, registerUser };
