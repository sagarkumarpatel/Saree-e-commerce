const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./Cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "saree-store",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

module.exports = upload;
