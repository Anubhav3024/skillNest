const User = require("../../modals/user");
const Order = require("../../modals/Order");
const Review = require("../../modals/review");
const StudentCourses = require("../../modals/student-courses");
const mongoose = require("mongoose");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-userPassword");
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user?._id) === String(id)) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot delete their own account from this route",
      });
    }

    const session = await mongoose.startSession();
    let deletedUser;

    try {
      await session.withTransaction(async () => {
        await Order.deleteMany({ userId: id }, { session });
        await Review.deleteMany({ userId: id }, { session });
        await StudentCourses.deleteMany({ userId: id }, { session });
        deletedUser = await User.findByIdAndDelete(id, { session });
      });
    } finally {
      session.endSession();
    }

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { getAllUsers, deleteUser };
