const User = require("../modals/user");
const Order = require("../modals/Order");
const StudentCourses = require("../modals/student-courses");
const Review = require("../modals/review");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const updateUserProfile = async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.body;
    const requesterId = String(req.user?._id || "");
    const targetUserId = userId ? String(userId) : requesterId;

    if (targetUserId !== requesterId && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { userName, userEmail },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        userEmail: updatedUser.userEmail,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user?._id).select("+userPassword");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.userPassword,
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid old password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.userPassword = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-userPassword");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Some error occurred!" });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      String(req.user?._id) !== String(userId) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const studentCourses = await StudentCourses.findOne({ userId });

    return res.status(200).json({
      success: true,
      courses: studentCourses ? studentCourses.courses : [],
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Some error occurred!" });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      String(req.user?._id) !== String(userId) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const orders = await Order.find({ userId, paymentStatus: "paid" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Some error occurred!" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      String(req.user?._id) !== String(userId) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const session = await mongoose.startSession();
    let deleted;

    try {
      await session.withTransaction(async () => {
        await Order.deleteMany({ userId }, { session });
        await StudentCourses.deleteMany({ userId }, { session });
        await Review.deleteMany({ userId }, { session });
        deleted = await User.findByIdAndDelete(userId, { session });
      });
    } finally {
      session.endSession();
    }

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = {
  updateUserProfile,
  changePassword,
  getUserProfile,
  getEnrolledCourses,
  getPaymentHistory,
  deleteAccount,
};
