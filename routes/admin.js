const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const upload = require("../utils/multer");

// Admin entry (decides signup vs login)
router.get("/admin", adminController.entry);

// Admin login page
router.get("/admin/login", adminController.loginPage);

// Admin login POST
router.post("/admin/login", adminController.loginPost); // We'll handle passport inside controller

// Admin signup
router.get("/admin/signup", adminController.signupPage);
router.post("/admin/signup", adminController.signupPost);

// Admin dashboard
router.get("/admin/dashboard", adminController.isAdmin, adminController.dashboard);

// Add saree
router.get("/admin/add-saree", adminController.isAdmin, adminController.addSareePage);
router.post(
  "/admin/add-saree",
  upload.single("image"),  // Multer middleware
  adminController.isAdmin,
  adminController.addSaree
);

// View all carts
router.get("/admin/carts", adminController.isAdmin, adminController.viewCarts);

// Delete user cart
router.post("/admin/carts/delete/:cartId", adminController.isAdmin, adminController.deleteCart);

// View all orders
router.get("/admin/orders", adminController.isAdmin, adminController.viewOrders);

// View order details
router.get("/admin/orders/:orderId", adminController.isAdmin, adminController.viewOrderDetails);

// Update order status
router.post("/admin/orders/:orderId/update", adminController.isAdmin, adminController.updateOrderStatus);

// View inventory
router.get("/admin/inventory", adminController.isAdmin, adminController.viewInventory);

// View all users (User Order History)
router.get("/admin/users", adminController.isAdmin, adminController.viewUsers);

// View specific user's orders
router.get("/admin/users/:userId/orders", adminController.isAdmin, adminController.viewUserOrders);

// Edit product page
router.get("/admin/edit-saree/:sareeId", adminController.isAdmin, adminController.editSareePage);

// Update product
router.post(
  "/admin/edit-saree/:sareeId",
  upload.single("image"),
  adminController.isAdmin,
  adminController.updateSaree
);

// Delete product
router.post("/admin/delete-saree/:sareeId", adminController.isAdmin, adminController.deleteSaree);

module.exports = router;
