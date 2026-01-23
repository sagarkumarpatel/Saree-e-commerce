const express = require("express");
const Saree = require("../models/Saree");
const Order = require("../models/Order");
const { isLoggedIn } = require("../middlewares/auth");
const router = express.Router();

// Home page
router.get("/", async (req, res) => {
  const { price } = req.query;
  
  let query = { productStatus: "Active", stockStatus: "In Stock" };
  
  // Apply price filter
  if (price === 'low') {
    query.price = { $lt: 1000 };
  } else if (price === 'mid') {
    query.price = { $gte: 1000, $lte: 3000 };
  } else if (price === 'high') {
    query.price = { $gt: 3000 };
  }
  
  const sarees = await Saree.find(query).limit(12);
  res.render("home", { sarees });
});

// Search route
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const searchQuery = q ? q.trim() : "";
    
    if (!searchQuery) {
      return res.render("search-results", { 
        sarees: [], 
        searchQuery: "",
        message: "Please enter a search term" 
      });
    }
    
    // Search in title, description, and category (case-insensitive, partial match)
    const sarees = await Saree.find({
      $and: [
        { productStatus: "Active" },
        { stockStatus: "In Stock" },
        {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } }
          ]
        }
      ]
    });
    
    res.render("search-results", { 
      sarees, 
      searchQuery,
      message: sarees.length === 0 ? `No products found for '${searchQuery}'` : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error searching products");
  }
});

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

router.get("/order-success", (req, res) => {
  res.render("order-success");
});

// User orders page
router.get("/my-orders", isLoggedIn, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.saree")
      .sort({ createdAt: -1 });
    res.render("my-orders", { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading orders");
  }
});

// User single order details
router.get("/my-orders/:orderId", isLoggedIn, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id })
      .populate("products.saree");
    
    if (!order) {
      return res.status(404).send("Order not found");
    }
    
    res.render("order-detail", { order });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading order details");
  }
});

module.exports = router;
