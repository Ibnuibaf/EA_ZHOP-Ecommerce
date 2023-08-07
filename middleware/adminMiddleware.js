const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = upload.single('file');

const notlogged = (req, res, next) => {
  try {
    if (req.session.admin) {
      res.redirect('/admin/dashboard')
    } else {
      next()
    }
  } catch (error) {
    console.log(error.message);
  }
}
const loggedIn = (req, res, next) => {
  try {
    if (req.session.admin) {
      next()
    } else {
      res.redirect('/admin')
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  uploadImage,
  loggedIn,
  notlogged
}