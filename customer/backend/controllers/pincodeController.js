const axios = require("axios");

exports.getPincodeDetails = async (req, res) => {
  const { pincode } = req.params;

  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: "Invalid pincode format" });
  }

  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = response.data[0];

    if (data.Status !== "Success") {
      return res.status(404).json({ error: "No data found for this PIN code" });
    }

    const info = data.PostOffice[0];

    res.status(200).json({
      pincode,
      state: info.State,
      district: info.District,
      area: info.Name, // This can be town/village/locality
    });
  } catch (err) {
    console.error("PIN code lookup error:", err.message);
    res.status(500).json({ error: "Error fetching pincode details" });
  }
};
