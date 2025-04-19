const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productid: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productnumber: { type: String, required: true },
  productname: { type: String, required: true },
  categoryid: { type: String, required: true },
  subcategoryid: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  finalprice: { type: Number, required: true },
  sellerid: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  isAvailable: { type: Boolean, default: true },
});

const orderSchema = new mongoose.Schema({
  orderid: { type: String, required: true, unique: true },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalamount: { type: Number, required: true },
  shippingamount: { type: Number, required: true },
  totalpayable: { type: Number, required: true },
  paymentmethod: { type: String, enum: ['UPI', 'Card', 'Wallet', 'COD'], required: true },
  paymentstatus: { type: String, enum: ['successful', 'failed', 'pending'], required: true },
  orderstatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'canceled'], required: true },

  shippingaddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  createdat: { type: Date, default: Date.now },
  updatedat: { type: Date, default: Date.now },

  // Metadata
  transactionTime: { type: Date },
  transactionId: { type: String },
  trackingStatus: { type: String, default: "Order Created" },

  // Optional Info
  giftMessage: { type: String },
  deliveryRecipient: { type: String },
  couponCode: { type: String },
  couponDiscount: { type: Number },
  taxAmount: { type: Number },
  isGift: { type: Boolean, default: false },
  orderTrackingNumber: { type: String },
  shiprocketShippingCost: { type: Number },

  userContact: { type: String },
  userEmail: { type: String },
  shiprocketData: { type: Object },

  orderHistory: [
    {
      status: { type: String },
      timestamp: { type: Date, default: Date.now },
      notes: { type: String },
    }
  ]
});

module.exports = mongoose.model("orders", orderSchema);
