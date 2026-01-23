require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
const mongoose=require("mongoose");
const path = require("path");
const flash = require("connect-flash");


const app = express();
connectDB();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View Engine
app.set("view engine", "ejs");

// Public folder for CSS/JS
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAdmin = Boolean(req.session && req.session.isAdmin);
  res.locals.flash = req.flash();
  next();
});

const authRoutes = require("./routes/auth");
app.use(authRoutes);

//Admin routes
const adminRoutes = require("./routes/admin");
app.use(adminRoutes);

// Cart routes
const cartRoutes = require("./routes/cart");
app.use(cartRoutes);

//// Saree (product) APIs
const sareeRoutes = require("./routes/saree");
app.use(sareeRoutes);

// User routes (home, pages)
const userRoutes = require("./routes/user");
app.use(userRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
