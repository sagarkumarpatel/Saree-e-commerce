const Saree = require("../models/Saree");
const Cart = require("../models/Cart");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const User = require("../models/User");
const cloudinary = require("../config/Cloudinary");
const bcrypt = require("bcryptjs");

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect("/admin/login");
};

// Admin login page
exports.loginPage = (req, res) => {
  res.render("admin/login");
};

// Admin entry: if no admin, go to signup, else login
exports.entry = async (req, res) => {
  const admin = await Admin.findOne();
  if (!admin) return res.redirect("/admin/signup");
  return res.redirect("/admin/login");
};

// Admin signup page
exports.signupPage = async (req, res) => {
  const admin = await Admin.findOne();
  if (admin) return res.redirect("/admin/login");
  res.render("admin/signup");
};

// Admin signup POST (only one admin allowed)
exports.signupPost = async (req, res) => {
  const existingAdmin = await Admin.findOne();
  if (existingAdmin) return res.redirect("/admin/login");

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    req.flash("error", "All fields are required.");
    return res.redirect("/admin/signup");
  }

  const emailExists = await Admin.findOne({ email });
  if (emailExists) {
    req.flash("error", "Email already registered.");
    return res.redirect("/admin/signup");
  }

  const adminUser = new Admin({ name, email, password });
  await adminUser.save();

  req.session.adminId = adminUser._id;
  req.session.isAdmin = true;

  return res.redirect("/admin/dashboard");
};

// Admin login POST (simple check without passport for now)
exports.loginPost = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    req.flash("error", "Invalid admin email or password.");
    return res.redirect("/admin/login");
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    req.flash("error", "Invalid admin email or password.");
    return res.redirect("/admin/login");
  }

  req.session.adminId = admin._id;
  req.session.isAdmin = true;
  res.redirect("/admin/dashboard");
};

// Dashboard
exports.dashboard = async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const newOrders = await Order.countDocuments({ status: "New" });
  const confirmedOrders = await Order.countDocuments({ status: "Confirmed" });
  const shippedOrders = await Order.countDocuments({ status: "Shipped" });
  const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
  const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });
  
  res.render("admin/dashboard", { 
    totalOrders, 
    newOrders, 
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders
  });
};

// Add saree page
exports.addSareePage = (req, res) => {
  res.render("admin/addSaree");
};

// Add saree POST
exports.addSaree = async (req, res) => {
  try {
    const { title, description, price, discountPercent, category, stock, productStatus } = req.body;
    const file = req.file;

    if (!file) {
      return res.send("Please upload an image");
    }

    const result = await cloudinary.uploader.upload(file.path);

    // Determine stock status based on quantity
    const stockStatus = parseInt(stock) > 0 ? "In Stock" : "Out of Stock";

    const newSaree = new Saree({
      title,
      name: title, // Backward compatibility
      description,
      price,
      discountPercent: parseInt(discountPercent) || 0,
      category,
      stock: parseInt(stock) || 0,
      stockStatus,
      productStatus: productStatus || "Active",
      image: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });

    await newSaree.save();
    res.redirect("/admin/inventory");
  } catch (err) {
    console.log(err);
    res.redirect("/admin/add-saree");
  }
};

// View all carts
exports.viewCarts = async (req, res) => {
  const carts = await Cart.find().populate("user").populate("items.saree");
  res.render("admin/carts", { carts });
};

// Delete/Cancel user cart
exports.deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    await Cart.findByIdAndUpdate(cartId, {
      status: "cancelled",
      cancelledAt: new Date()
    });
    res.redirect("/admin/carts");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error cancelling cart");
  }
};

// View all orders
exports.viewOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .sort({ createdAt: -1 });
    res.render("admin/orders", { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading orders");
  }
};

// View order details
exports.viewOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("products.saree");
    
    if (!order) {
      return res.status(404).send("Order not found");
    }
    
    res.render("admin/order-details", { order });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading order details");
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, adminNotes } = req.body;
    
    await Order.findByIdAndUpdate(orderId, {
      status,
      adminNotes: adminNotes || ""
    });
    
    res.redirect(`/admin/orders/${orderId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating order");
  }
};

// View inventory (all sarees)
exports.viewInventory = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    // If search query exists, search in title, description, and category
    if (search && search.trim()) {
      const searchQuery = search.trim();
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } }
        ]
      };
    }
    
    const sarees = await Saree.find(query).sort({ createdAt: -1 });
    res.render("admin/inventory", { 
      sarees,
      searchQuery: search || ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading inventory");
  }
};

// View all users with order counts
exports.viewUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    
    // Get order count for each user
    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          orderCount
        };
      })
    );
    
    res.render("admin/users", { users: usersWithOrderCount });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading users");
  }
};

// View specific user's order history
exports.viewUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    const orders = await Order.find({ user: userId })
      .populate("products.saree")
      .sort({ createdAt: -1 });
    
    res.render("admin/user-orders", { user, orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading user orders");
  }
};

// Edit product page
exports.editSareePage = async (req, res) => {
  try {
    const { sareeId } = req.params;
    const saree = await Saree.findById(sareeId);
    
    if (!saree) {
      return res.status(404).send("Product not found");
    }
    
    res.render("admin/editSaree", { saree });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading product");
  }
};

// Update product
exports.updateSaree = async (req, res) => {
  try {
    const { sareeId } = req.params;
    const { title, description, category, price, discountPercent, stock, productStatus } = req.body;
    
    const updateData = {
      title,
      description,
      category,
      price: Number(price),
      discountPercent: Number(discountPercent) || 0,
      stock: Number(stock),
      productStatus
    };
    
    // If new image is uploaded, upload to Cloudinary
    if (req.file) {
      const saree = await Saree.findById(sareeId);
      
      // Delete old image from Cloudinary
      if (saree && saree.image && saree.image.public_id) {
        await cloudinary.uploader.destroy(saree.image.public_id);
      }
      
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.image = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }
    
    await Saree.findByIdAndUpdate(sareeId, updateData);
    res.redirect("/admin/inventory");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating product");
  }
};

// Delete product
exports.deleteSaree = async (req, res) => {
  try {
    const { sareeId } = req.params;
    const saree = await Saree.findById(sareeId);
    
    if (!saree) {
      return res.status(404).send("Product not found");
    }
    
    // Delete image from Cloudinary
    if (saree.image && saree.image.public_id) {
      await cloudinary.uploader.destroy(saree.image.public_id);
    }
    
    // Delete the product from database
    await Saree.findByIdAndDelete(sareeId);
    
    res.redirect("/admin/inventory");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
};
