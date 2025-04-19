const axios = require("axios");

let shiprocketToken = null;
let tokenExpiry = null;

const authenticate = async () => {
  if (shiprocketToken && new Date() < tokenExpiry) return shiprocketToken;

  const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
    email: "apiadmin@leafylegacy.in",
    password: "Shubham@248",
  });

  shiprocketToken = response.data.token;
  tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000); // 9 days buffer
  return shiprocketToken;
};

exports.getShippingRate = async (req, res) => {
  try {
    const { pickup, delivery, weight } = req.query;
    const token = await authenticate();

    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${pickup}&delivery_postcode=${delivery}&cod=0&weight=${weight}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const couriers = response.data.data.available_courier_companies;
    if (!couriers || couriers.length === 0)
      return res.status(404).json({ message: "No courier available for route" });

    const cheapest = couriers.reduce((min, c) => (c.rate < min.rate ? c : min), couriers[0]);

    res.json({
      deliveryCharge: cheapest.rate,
      courier: cheapest.courier_name,
      estimatedDeliveryDays: cheapest.estimated_delivery_days,
    });
  } catch (err) {
    console.error("Shiprocket API error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch shipping rate" });
  }
};
