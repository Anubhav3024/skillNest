const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async (filePath, options = {}) => {
  try {
    const resourceType = options.resourceType || "auto";
    const uploadOptions = {
      resource_type: resourceType,
      chunk_size: 6000000, // 6MB chunks
      folder: "lms_uploads",
    };

    const res = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(filePath, uploadOptions, (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
    });

    if (!res?.secure_url && !res?.url && res?.public_id) {
      try {
        const fetched = await cloudinary.api.resource(res.public_id, {
          resource_type: resourceType,
        });
        return { ...res, ...fetched };
      } catch (fetchError) {
        console.error("Cloudinary Resource Fetch Error:", fetchError);
      }
    }

    if (!res?.secure_url && !res?.url && !res?.playback_url) {
      const err = new Error("Cloudinary upload succeeded but no URL fields returned");
      err.details = {
        public_id: res?.public_id,
        resource_type: res?.resource_type || resourceType,
        format: res?.format,
        has_secure_url: Boolean(res?.secure_url),
        has_url: Boolean(res?.url),
        has_playback_url: Boolean(res?.playback_url),
        keys: res ? Object.keys(res) : [],
      };
      throw err;
    }

    return res;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    if (error?.details) {
      console.error("Cloudinary Upload Error Details:", error.details);
    }
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
