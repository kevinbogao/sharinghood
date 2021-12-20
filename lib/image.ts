import cloudinary from "cloudinary";

// @ts-ignore
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export async function upload(image: string): Promise<string> {
  const result = await cloudinary.v2.uploader.upload(image, (err) => {
    if (err) throw new Error(err.message);
  });
  return result.secure_url;
}
