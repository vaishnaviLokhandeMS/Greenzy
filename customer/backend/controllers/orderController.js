const Order = require("../models/orderModel");
const { v4: uuidv4 } = require("uuid");

exports.createBuyNowOrder = async (req, res) => {
  try {
    const {
      userid,
      items,
      totalamount,
      shippingamount,
      totalpayable,
      paymentmethod,
      paymentstatus,
      orderstatus,
      shippingaddress,
      userContact,
      userEmail,
      platformFee,
      gstAmount,
    } = req.body;

    const transactionTime = new Date();
    const transactionId = uuidv4();
    const orderid = `LL-${Date.now()}`;

    const newOrder = new Order({
      orderid,
      userid,
      items,
      totalamount,
      shippingamount,
      totalpayable,
      paymentmethod,
      paymentstatus,
      orderstatus,
      shippingaddress,
      userContact,
      userEmail,
      platformFee,
      gstAmount,
      transactionTime,
      transactionId,
      trackingStatus: "Order Created",
      orderTrackingNumber: transactionId, // Optional - same as txn for now
      orderHistory: [
        {
          status: "pending",
          notes: "Order placed"
        }
      ]
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderid,
      transactionId
    });

  } catch (error) {
    console.error("Order creation failed:", error.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong while placing order."
    });
  }
};
