const express = require("express");
const sareeController = require("../controllers/sareeController");

const router = express.Router();

router.get("/sarees", sareeController.getSarees);
router.get("/api/sarees", sareeController.getSareesAPI);
router.get("/sarees/search", sareeController.searchSarees);

module.exports = router;
