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

const fs = require("fs");

const uploadDir = path.join(__dirname, "../../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const MAX_VIDEO_SIZE_MB = Number(process.env.MAX_VIDEO_SIZE_MB || 500);
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/mpeg",
  "video/x-flv",
  "video/3gpp",
  "video/3gpp2",
]);

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 1. Validation
    if (req.file.size > MAX_VIDEO_SIZE) {
      return res.status(400).json({ 
        success: false, 
        message: `File too large. Maximum allowed size is ${MAX_VIDEO_SIZE_MB}MB.` 
      });
    }

    const isVideo = req.file.mimetype.startsWith("video/");
    const isImage = req.file.mimetype.startsWith("image/");
    const isDocument = req.file.mimetype.startsWith("application/");

    if (
      (isVideo && !ALLOWED_VIDEO_TYPES.has(req.file.mimetype)) ||
      (!isVideo && !isImage && !isDocument)
    ) {
      return res.status(400).json({ 
        success: false, 
        message: `Unsupported file type: ${req.file.mimetype}. Please upload a video, image, or scholarly document.` 
      });
    }

    console.log(`[Media Upload] Starting upload for: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB), Type: ${req.file.mimetype}`);
    
    // Reuse MIME flags for Cloudinary resource typing
    const resourceType = isVideo ? "video" : isImage ? "image" : "raw";

    console.log(
      `[Media Upload] ResourceType=${resourceType} Mime=${req.file.mimetype} SizeMB=${(req.file.size / 1024 / 1024).toFixed(2)} Name=${req.file.originalname}`
    );

    const result = await uploadMediaToCloudinary(req.file.path, { resourceType });

    console.log(
      "[Media Upload] Cloudinary response summary:",
      {
        public_id: result?.public_id,
        resource_type: result?.resource_type,
        format: result?.format,
        secure_url: Boolean(result?.secure_url),
        url: Boolean(result?.url),
        playback_url: Boolean(result?.playback_url),
        keys: result ? Object.keys(result) : [],
      }
    );

    if (!result || (!result.secure_url && !result.url && !result.playback_url)) {
      return res.status(500).json({
        success: false,
        message: "Upload completed but no URL received from storage. Please try again.",
      });
    }
    
    // 2. Extract Metadata (Industrial standard)
    const fileUrl = result.secure_url || result.url || result.playback_url;
    const metadata = {
      url: fileUrl,
      public_id: result.public_id,
      thumbnailUrl: fileUrl.replace(/\.[^/.]+$/, ".jpg"),
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
      .json({
        success: false,
        message: error.message || "Error uploading via media route",
        debug: process.env.NODE_ENV !== "production" ? error?.details || undefined : undefined,
      });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum allowed size is ${MAX_VIDEO_SIZE_MB}MB.`,
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  return next(err);
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
