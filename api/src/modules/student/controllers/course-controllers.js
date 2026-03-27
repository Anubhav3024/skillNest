const Course = require("../../../models/course");
const StudentCourses = require("../../../models/student-courses");
const User = require("../../../models/user");

const escapeRegex = (input = "") =>
  input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
      page = 1,
      limit = 12,
      search = "",
    } = req.query;

    let filters = { isPublished: true };

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (level.length) {
      filters.level = { $in: level.split(",") };
    }

    if (primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }

    if (search && search.trim()) {
      const safeQuery = escapeRegex(search.trim());
      filters.$or = [
        { title: { $regex: safeQuery, $options: "i" } },
        { subtitle: { $regex: safeQuery, $options: "i" } },
        { category: { $regex: safeQuery, $options: "i" } },
        { instructorName: { $regex: safeQuery, $options: "i" } },
      ];
    }

    let sortParam = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.pricing = 1;
        break;

      case "price-hightolow":
        sortParam.pricing = -1;
        break;

      case "title-atoz":
        sortParam.title = 1;
        break;

      case "title-ztoa":
        sortParam.title = -1;
        break;

      default:
        sortParam.pricing = 1;
        break;
    }

    const skip = (page - 1) * limit;
    const totalCourses = await Course.countDocuments(filters);
    const totalPages = Math.ceil(totalCourses / limit);

    const courseList = await Course.find(filters)
      .sort(sortParam)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      courseList,
      totalPages,
      totalCourses,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error in getAllStudentViewCourses:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching all courses of student",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      console.log("id undefined");
      return;
    }

    const courseDetails = await Course.findById(id).lean();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Error fetching details of the specific course",
      });
    }

    // Fetch instructor details to include avatar and bio
    const instructorDetails = await User.findById(courseDetails.instructorId)
      .select("avatar philosophy socialLinks experience userName userEmail")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      courseDetails: {
        ...courseDetails,
        instructorDetails
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching details of the specific course",
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const coursesBoughtByCurrentStudent = await StudentCourses.findOne({
      userId: studentId,
    });
    


    const boughtOrNot =
      coursesBoughtByCurrentStudent?.courses?.findIndex(
        (item) => item.courseId === id
      ) > -1;


    return res.status(200).json({
      success: true,
      boughtOrNot,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking course bought or not",
    });
  }
};

module.exports = { getAllStudentViewCourses, getStudentViewCourseDetails, checkCoursePurchaseInfo };
