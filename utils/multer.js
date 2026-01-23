const multer = require("multer");

const storage = multer.diskStorage({}); // temporary storage
const upload = multer({ storage });

module.exports = upload;
