const User = require("../../models/user");
const Order = require("../../models/Order");
const StudentCourses = require("../../models/student-courses");
const Review = require("../../models/review");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const updateUserProfile = async (req, res) => {
  try {
    const { 
      userId, 
      userName, 
      userEmail, 
      philosophy, 
      socialLinks, 
      avatar, 
      experience, 
      skills,
      upiId,
      bankDetails
    } = req.body;
    const requesterId = String(req.user?._id || "");
    const targetUserId = userId ? String(userId) : requesterId;

    if (targetUserId !== requesterId && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Duplicate checks if email or username is changing
    if (userEmail && userEmail.toLowerCase() !== user.userEmail.toLowerCase()) {
      const existingEmail = await User.findOne({ userEmail: userEmail.toLowerCase() });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
    }

    if (userName && userName.toLowerCase() !== user.userName.toLowerCase()) {
      const existingName = await User.findOne({ userName: userName.toLowerCase() });
      if (existingName) {
        return res.status(409).json({ success: false, message: "Username already taken" });
      }
    }

    const updateData = {};
    if (userName) updateData.userName = userName.toLowerCase();
    if (userEmail) updateData.userEmail = userEmail.toLowerCase();
    if (philosophy !== undefined) updateData.philosophy = philosophy;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (experience !== undefined) updateData.experience = experience;
    if (skills !== undefined) updateData.skills = skills;
    if (upiId !== undefined) updateData.upiId = upiId;
    if (bankDetails !== undefined) updateData.bankDetails = bankDetails;

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { $set: updateData },
      { new: true },
    ).select("-userPassword");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
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

const updateUserSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { settings } },
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
      message: "Settings updated successfully",
      settings: updatedUser.settings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
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
  updateUserSettings,
};
