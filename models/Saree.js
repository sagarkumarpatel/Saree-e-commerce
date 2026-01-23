const mongoose = require("mongoose");

const sareeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: String, // Backward compatibility
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  stockStatus: { 
    type: String, 
    enum: ["In Stock", "Out of Stock"], 
    default: "In Stock" 
  },
  productStatus: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Active" 
  },
  image: {
    url: String,
    public_id: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

// Auto-update stock status and finalPrice
sareeSchema.pre("save", function() {
  // Calculate final price based on discount
  if (this.discountPercent > 0) {
    const discountAmount = (this.price * this.discountPercent) / 100;
    this.finalPrice = this.price - discountAmount;
  } else {
    this.finalPrice = this.price;
  }
  
  // Update stock status
  if (this.stock <= 0) {
    this.stockStatus = "Out of Stock";
  } else {
    this.stockStatus = "In Stock";
  }
});

module.exports = mongoose.model("Saree", sareeSchema);
