import cloudinary from "cloudinary";

// @ts-ignore
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export default async function uploadImg(img: string): Promise<string> {
  try {
    const result = await cloudinary.v2.uploader.upload(img);
    return JSON.stringify(result);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
