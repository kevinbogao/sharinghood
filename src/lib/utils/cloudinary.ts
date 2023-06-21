import { v2 as cloudinary } from "cloudinary";

import { CONFIG } from "../Config";

cloudinary.config({
  cloud_name: CONFIG.CLOUDINARY.CLOUD_NAME,
  api_key: CONFIG.CLOUDINARY.API_KEY,
  api_secret: CONFIG.CLOUDINARY.API_SECRET,
});

export async function uploadImage(image: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(image);
    return result.secure_url;
  } catch (_) {
    throw new Error("Image server error");
  }
}

export async function destroyImage(imageUrl: string): Promise<void> {
  const splitUrl = imageUrl.split("/");
  const urlSuffix = splitUrl[splitUrl.length - 1];
  if (!urlSuffix) {
    return;
  }

  const [publicId] = urlSuffix.split(".");
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId);
}
