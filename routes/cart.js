const express = require("express");
const { isLoggedIn } = require("../middlewares/auth");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/cart", isLoggedIn, cartController.viewCart);
router.get("/cart/add/:sareeId", isLoggedIn, cartController.addToCart);
router.post("/cart/add/:sareeId", isLoggedIn, cartController.addToCart);
router.post("/cart/update/:sareeId", isLoggedIn, cartController.updateQuantity);
router.post("/cart/remove/:sareeId", isLoggedIn, cartController.removeItem);
router.get("/checkout", isLoggedIn, cartController.checkoutPage);
router.post("/checkout", isLoggedIn, cartController.placeOrder);

module.exports = router;
