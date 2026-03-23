const Course = require("../../../models/course");
const User = require("../../../models/user");

const escapeRegex = (input = "") =>
  input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const safeQuery = escapeRegex(query.trim());

    const courses = await Course.find({
      $or: [
        { title: { $regex: safeQuery, $options: "i" } },
        { subtitle: { $regex: safeQuery, $options: "i" } },
        { category: { $regex: safeQuery, $options: "i" } },
      ],
      isPublished: true,
    });

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Course.distinct("category");
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }).select(
      "userName",
    );
    return res.status(200).json({
      success: true,
      instructors,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { searchCourses, getAllCategories, getAllInstructors };
