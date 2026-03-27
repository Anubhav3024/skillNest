const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "BROADCAST",
        "COURSE_UPDATE",
        "NEW_LECTURE",
        "COURSE_SCHEDULE",
        "FEEDBACK",
        "ENROLLMENT",
        "PAYMENT",
        "GENERAL",
      ],
      default: "GENERAL",
    },
    recipientRole: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    entityType: {
      type: String,
      trim: true,
      default: null,
    },
    entityId: {
      type: String,
      trim: true,
      default: null,
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
