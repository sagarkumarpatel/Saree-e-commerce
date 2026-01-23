const Saree = require("../models/Saree");
// Get all sarees (API with filter & pagination)
exports.getSareesAPI = async (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  const page = parseInt(req.query.page, 10) || 1;

  const limit = 3; // 3 sarees per row
  const skip = (page - 1) * limit;

  let query = { productStatus: "Active", stockStatus: "In Stock" };

  if (category) query.category = category;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sarees = await Saree.find(query)
    .skip(skip)
    .limit(limit);

  const total = await Saree.countDocuments(query);

  res.json({
    sarees,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  });
};

// Search sarees
exports.searchSarees = async (req, res) => {
  const { q } = req.query;

  const sarees = await Saree.find({
    title: { $regex: q, $options: "i" },
    productStatus: "Active",
    stockStatus: "In Stock"
  });

  res.json(sarees);
};

// Get sarees page (EJS)
exports.getSarees = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;

  let filter = { productStatus: "Active", stockStatus: "In Stock" };

  if (req.query.price === "low") {
    filter.price = { $lt: 1000 };
  } 
  else if (req.query.price === "mid") {
    filter.price = { $gte: 1000, $lte: 3000 };
  } 
  else if (req.query.price === "high") {
    filter.price = { $gt: 3000 };
  }

  const sarees = await Saree.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);

  // AJAX request → JSON
  if (req.xhr) {
    return res.json(sarees);
  }

  // Normal request → EJS
  res.render("sarees/index", { sarees });
};
