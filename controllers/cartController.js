const Cart = require("../models/Cart");
const Saree = require("../models/Saree");
const Order = require("../models/Order");

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { sareeId } = req.params;

    // Check if saree exists
    const saree = await Saree.findById(sareeId);
    if (!saree) {
      return res.status(404).send("Saree not found");
    }

    let cart = await Cart.findOne({ user: req.user._id, status: "active" });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [], status: "active" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.saree.toString() === sareeId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ saree: sareeId, quantity: 1 });
    }

    await cart.save();
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding to cart");
  }
};

// View cart
exports.viewCart = async (req, res) => {
  try {
    const activeCart = await Cart.findOne({ user: req.user._id, status: "active" })
      .populate("items.saree");
    
    // Remove items with deleted products (saree is null)
    if (activeCart && activeCart.items) {
      activeCart.items = activeCart.items.filter(item => item.saree !== null);
      await activeCart.save();
    }
    
    res.render("cart", { cart: activeCart, cancelledCarts: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading cart");
  }
};

// Remove item
exports.removeItem = async (req, res) => {
  try {
    const { sareeId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id, status: "active" });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    cart.items = cart.items.filter(
      item => item.saree.toString() !== sareeId
    );

    await cart.save();
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing item");
  }
};

// Update quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { sareeId } = req.params;
    const { action } = req.body; // 'increase' or 'decrease'

    const cart = await Cart.findOne({ user: req.user._id, status: "active" });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      item => item.saree.toString() === sareeId
    );

    if (itemIndex === -1) {
      return res.status(404).send("Item not found in cart");
    }

    if (action === "increase") {
      cart.items[itemIndex].quantity += 1;
    } else if (action === "decrease") {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        // Remove item if quantity becomes 0
        cart.items.splice(itemIndex, 1);
      }
    }

    await cart.save();
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating quantity");
  }
};

// Checkout page
exports.checkoutPage = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, status: "active" })
      .populate("items.saree");

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    res.render("checkout", { cart, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading checkout page");
  }
};

// Place order
exports.placeOrder = async (req, res) => {
  try {
    const { fullName, mobileNumber, addressLine1, addressLine2, city, state, pincode, country } = req.body;

    const cart = await Cart.findOne({ user: req.user._id, status: "active" })
      .populate("items.saree");

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    // Calculate total using finalPrice
    let totalAmount = 0;
    const products = cart.items
      .filter(item => item.saree !== null) // Skip deleted products
      .map(item => {
        const itemPrice = item.saree.finalPrice || item.saree.price;
        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;
        return {
          saree: item.saree._id,
          quantity: item.quantity,
          price: itemPrice
        };
      });

    // Create order
    const order = new Order({
      user: req.user._id,
      products,
      shippingDetails: {
        fullName,
        mobileNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country: country || "India"
      },
      totalAmount,
      status: "New"
    });

    await order.save();

    // Clear the cart after placing order
    await Cart.findByIdAndDelete(cart._id);

    res.redirect("/order-success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error placing order");
  }
};
