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
      enum: ["student", "instructor", "admin"],
      required: true,
    },
    githubId: {
      type: String,
    },
    googleId: {
      type: String,
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
      // Student specific
      courseUpdates: { type: Boolean, default: true },
      promotionalEmails: { type: Boolean, default: false },
      progressReminders: { type: Boolean, default: true },
      publicProfile: { type: Boolean, default: true },
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
    fieldOfStudy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

UserSchema.index({ githubId: 1 }, { unique: true, sparse: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", UserSchema);
