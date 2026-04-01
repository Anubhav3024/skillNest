const mongoose = require("mongoose");

const LegalDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["privacy", "terms"],
      required: true,
      unique: true,
    },
    version: {
      type: String,
      required: true,
      default: "1.0",
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LegalDocument", LegalDocumentSchema);
