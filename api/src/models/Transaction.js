const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    instructorShare: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["captured", "settled", "refunded"],
      default: "captured",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    payoutDetails: {
      upiId: String,
      bankDetails: {
        accountNumber: String,
        ifsc: String,
        bankName: String,
      },
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
