const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

async function uploadImg(img) {
  const result = await cloudinary.v2.uploader.upload(img);
  return JSON.stringify(result);
}

module.exports = uploadImg;
