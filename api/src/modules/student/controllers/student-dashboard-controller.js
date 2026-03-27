const Course = require("../../../models/course");
const StudentCourses = require("../../../models/student-courses");
const CourseProgress = require("../../../models/course-Progress");
const Order = require("../../../models/Order");
const Activity = require("../../../models/Activity");

const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (String(req.user?._id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // 1. Get enrolled courses
    const studentCoursesDoc = await StudentCourses.findOne({ userId });
    const enrolledCourseIds = (studentCoursesDoc?.courses || []).map(c => c.courseId);

    // 2. Fetch full course details for enrolled courses
    const enrolledCourses = enrolledCourseIds.length > 0
      ? await Course.find({ _id: { $in: enrolledCourseIds } }).lean()
      : [];

    // 3. Fetch progress for each enrolled course
    const progressDocs = enrolledCourseIds.length > 0
      ? await CourseProgress.find({ userId, courseId: { $in: enrolledCourseIds } }).lean()
      : [];

    const progressMap = {};
    progressDocs.forEach(p => {
      progressMap[p.courseId] = p;
    });

    // 4. Build enriched course list with progress %
    let lastActiveCourse = null;
    let lastActiveDate = null;

    const coursesWithProgress = enrolledCourses.map(course => {
      const progress = progressMap[String(course._id)] || {};
      const totalLectures = course.curriculum?.length || 0;
      const completedLectures = progress.lecturesProgress?.filter(l => l.viewed)?.length || 0;
      const progressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

      // Find purchase info
      const purchaseInfo = studentCoursesDoc?.courses?.find(c => c.courseId === String(course._id));

      // Track most recently active course
      const lastViewed = progress.lecturesProgress?.reduce((latest, lp) => {
        if (lp.dateViewed && (!latest || new Date(lp.dateViewed) > new Date(latest))) {
          return lp.dateViewed;
        }
        return latest;
      }, null);

      if (lastViewed && (!lastActiveDate || new Date(lastViewed) > new Date(lastActiveDate))) {
        lastActiveDate = lastViewed;
        lastActiveCourse = {
          ...course,
          progressPercent,
          completedLectures,
          totalLectures,
        };
      }

      return {
        _id: course._id,
        title: course.title,
        image: course.image,
        category: course.category,
        level: course.level,
        instructorName: course.instructorName,
        pricing: course.pricing,
        totalLectures,
        completedLectures,
        progressPercent,
        isCompleted: progress.completed || false,
        completionDate: progress.completionDate,
        dateOfPurchase: purchaseInfo?.dateOfPurchase,
      };
    });

    // 5. Calculate stats
    const totalCoursesCompleted = coursesWithProgress.filter(c => c.isCompleted).length;
    const totalCoursesInProgress = coursesWithProgress.filter(c => !c.isCompleted && c.progressPercent > 0).length;
    const totalLecturesCompleted = coursesWithProgress.reduce((sum, c) => sum + c.completedLectures, 0);

    // 6. Get recommendations (courses not purchased, published)
    const recommendations = await Course.find({
      _id: { $nin: enrolledCourseIds },
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title image category level pricing instructorName students curriculum")
      .lean();

    const recommendationsWithMeta = recommendations.map(course => ({
      ...course,
      totalLectures: course.curriculum?.length || 0,
      totalStudents: course.students?.length || 0,
      totalDuration: course.curriculum?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0,
    }));

    // 8. Get chronological activity feed
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 9. Get recent successful orders
    const recentOrders = await Order.find({ userId, paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        enrolledCourses: coursesWithProgress,
        activeCourse: lastActiveCourse || (coursesWithProgress.length > 0 ? coursesWithProgress[0] : null),
        stats: {
          totalEnrolled: coursesWithProgress.length,
          totalCompleted: totalCoursesCompleted,
          totalInProgress: totalCoursesInProgress,
          totalLecturesCompleted,
        },
        recommendations: recommendationsWithMeta,
        recentOrders,
        activities,
      },
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching student dashboard data",
    });
  }
};

module.exports = { getStudentDashboard };
