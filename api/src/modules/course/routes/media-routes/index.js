const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");

const {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../../../utils/cloudinary");
const { performance } = require("perf_hooks");

const router = express.Router();

const upload = multer({ dest: path.join(os.tmpdir(), "uploads") });

const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 1. Validation
    if (req.file.size > MAX_VIDEO_SIZE) {
      return res.status(400).json({ 
        success: false, 
        message: `File too large. Maximum allowed size is ${(MAX_VIDEO_SIZE / 1024 / 1024).toFixed(0)}MB.` 
      });
    }

    if (!ALLOWED_VIDEO_TYPES.includes(req.file.mimetype) && !req.file.mimetype.startsWith("application/")) {
       // We allow application/ type for resources (PDFs, etc.), but for the main "upload" we check if it's a video for lectures.
       // Actually, the same route is used for resources. Let's make it smarter.
    }

    console.log(`[Media Upload] Starting upload for: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB), Type: ${req.file.mimetype}`);
    
    const result = await uploadMediaToCloudinary(req.file.path);
    
    // 2. Extract Metadata (Industrial standard)
    const metadata = {
      url: result.secure_url || result.url,
      public_id: result.public_id,
      thumbnailUrl: (result.secure_url || result.url).replace(/\.[^/.]+$/, ".jpg"), // Cloudinary auto-thumbnail
      duration: result.duration || 0,
      size: result.bytes || req.file.size,
      format: result.format,
    };

    console.log(`[Media Upload] Successfully uploaded to Cloudinary. Metadata:`, JSON.stringify(metadata, null, 2));

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      result: metadata,
    });
  } catch (error) {
    console.error(`[Media Upload] Error uploading ${req.file?.originalname || 'file'}:`, error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Error uploading via media route" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      // console.log("Asset ID required for deletion");
      return res
        .status(400)
        .json({ message: "Asset ID required for deletion" });
    }

    await deleteMediaFromCloudinary(id);


    return res.status(200).json({
      success: true,
      message: "File deleted via media route",
    });
  } catch (error) {
    console.error("Error deleting via media route", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting via media route" });
  }
});

router.post("/bulk-upload", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided for bulk upload" });
    }

    console.log(`[Bulk Upload] Starting transmission for ${req.files.length} files...`);

    const uploadPromises = req.files.map((fileItem) => {
      console.log(`[Bulk Upload] Processing: ${fileItem.originalname} (${(fileItem.size / 1024 / 1024).toFixed(2)} MB)`);
      return uploadMediaToCloudinary(fileItem.path);
    });

    const results = await Promise.all(uploadPromises);
    
    console.log(`[Bulk Upload] All ${results.length} transmissions successful`);

    return res.status(200).json({
      success: true,
      message: "Bulk upload successful",
      result: results,
    });
  } catch (error) {
    console.error("[Bulk Upload] Transmission Error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Error bulk uploading files" });
  }
});

module.exports = router;
