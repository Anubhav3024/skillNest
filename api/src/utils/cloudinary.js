const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async (filePath) => {
  try {
    const res = await cloudinary.uploader.upload_large(filePath, {
      resource_type: "auto",
      chunk_size: 6000000, // 6MB chunks
      folder: "lms_uploads",
    });
    return res;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Error uploading to cloudinary: " + (error.message || "Unknown error"));
  }
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Failed to delete asset from cloudinary");
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
