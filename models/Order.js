const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  products: [
    {
      saree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Saree"
      },
      quantity: Number,
      price: Number
    }
  ],
  shippingDetails: {
    fullName: String,
    mobileNumber: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" }
  },
  totalAmount: Number,
  status: { type: String, default: "New", enum: ["New", "Confirmed", "Shipped", "Delivered", "Cancelled"] },
  adminNotes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
