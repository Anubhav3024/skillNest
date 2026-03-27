const CourseProgress = require("../../../models/course-Progress");
const StudentCourses = require("../../../models/student-courses");
const Activity = require("../../../models/Activity");
const Transaction = require("../../../models/Transaction");

const getActivityOverview = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 1. Courses Completed
    const coursesCompleted = await CourseProgress.countDocuments({
      userId,
      completed: true,
    });

    // 2. Lectures Watched (count all 'viewed' items in all course progress records)
    const allCourseProgress = await CourseProgress.find({ userId });
    let lecturesWatched = 0;
    allCourseProgress.forEach((progress) => {
      lecturesWatched += progress.lecturesProgress.filter((l) => l.viewed).length;
    });

    // 3. Total Enrolled
    const studentCourses = await StudentCourses.findOne({ userId });
    const totalEnrolled = studentCourses?.courses?.length || 0;

    // 4. Learning Timeline (last 15 activities)
    const timeline = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(15);

    // 5. Recent Purchases (last 5 transactions)
    const recentPurchases = await Transaction.find({ studentId: userId })
      .sort({ orderDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        coursesCompleted,
        lecturesWatched,
        totalEnrolled,
        timeline,
        recentPurchases,
      },
    });
  } catch (error) {
    console.error("Error in getActivityOverview:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { getActivityOverview };
