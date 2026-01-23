const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();

// Signup
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/signup");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      req.flash("error", "Email already registered.");
      return res.redirect("/signup");
    }

    const user = new User({ name, email, password });
    await user.save();

    req.login(user, (err) => {
      if (err) {
        console.error("Signup login error:", err);
        req.flash("error", "Signup succeeded, but login failed.");
        return res.redirect("/login");
      }
      return res.redirect("/");
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (err && err.code === 11000) {
      req.flash("error", "Email already registered.");
      return res.redirect("/signup");
    }
    req.flash("error", err.message || "Signup failed. Please try again.");
    return res.redirect("/signup");
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      console.error("Login error:", err);
      return next(err);
    }
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error("Login session error:", loginErr);
        return next(loginErr);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

module.exports = router;
