const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    userEmail: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    userPassword: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "instructor"],
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    philosophy: {
      type: String,
      default: "",
    },
    socialLinks: {
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      external: { type: String, default: "" },
    },
    settings: {
      twoFactorAuth: { type: Boolean, default: false },
      scholarEnrollmentAlerts: { type: Boolean, default: true },
      revenueMilestones: { type: Boolean, default: true },
      communityInsights: { type: Boolean, default: false },
      vaultIndexing: { type: Boolean, default: true },
      analyticsSharing: { type: Boolean, default: false },
    },
    experience: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    upiId: {
      type: String,
      default: "",
    },
    bankDetails: {
      accountNumber: { type: String, default: "" },
      ifsc: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

// UserSchema.index({ userEmail: 1 }, { unique: true });
// UserSchema.index({ userName: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
