const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  items: [
    {
      saree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Saree"
      },
      quantity: Number
    }
  ],
  status: {
    type: String,
    enum: ["active", "cancelled"],
    default: "active"
  },
  cancelledAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
