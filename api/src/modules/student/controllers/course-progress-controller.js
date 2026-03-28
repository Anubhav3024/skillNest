const CourseProgress = require("../../../models/course-Progress");
const Course = require("../../../models/course");
const StudentCourses = require("../../../models/student-courses");
const Activity = require("../../../models/Activity");

const isAdmin = (req) => req.user?.role === "admin";

const ensureSelfOrAdmin = (req, targetUserId) => {
  const requesterId = String(req.user?._id || "");
  if (!requesterId) return false;
  if (isAdmin(req)) return true;
  return requesterId === String(targetUserId || "");
};

const hasPurchasedCourse = (studentCoursesDoc, courseId) =>
  Boolean(
    studentCoursesDoc?.courses?.some(
      (item) => String(item.courseId) === String(courseId),
    ),
  );

const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const userId = String(req.user?._id || "");
    const courseId = String(req.body?.courseId || "").trim();
    const lectureId = String(req.body?.lectureId || "").trim();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!courseId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: "courseId and lectureId are required",
      });
    }

    const studentCoursesDoc = await StudentCourses.findOne({ userId }).lean();
    if (!hasPurchasedCourse(studentCoursesDoc, courseId)) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase this course to access it",
      });
    }

    const course = await Course.findById(courseId)
      .select("_id title curriculum")
      .lean();
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lecture = course.curriculum?.find(
      (item) => String(item._id) === lectureId,
    );
    if (!lecture) {
      return res.status(400).json({
        success: false,
        message: "Invalid lectureId",
      });
    }

    const now = new Date();
    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        completionDate: null,
        lecturesProgress: [],
      });
    }

    const existingItem = progress.lecturesProgress?.find(
      (item) => String(item.lectureId) === lectureId,
    );
    const wasViewed = Boolean(existingItem?.viewed);
    const wasCompleted = Boolean(progress.completed);

    if (existingItem) {
      existingItem.viewed = true;
      existingItem.dateViewed = now;
    } else {
      progress.lecturesProgress.push({
        lectureId,
        viewed: true,
        dateViewed: now,
      });
    }

    const totalLectures = Array.isArray(course.curriculum)
      ? course.curriculum.length
      : 0;
    const viewedCount = progress.lecturesProgress.filter((item) =>
      Boolean(item?.viewed),
    ).length;

    const allLecturesViewed =
      totalLectures > 0 &&
      viewedCount >= totalLectures &&
      progress.lecturesProgress.every((item) => Boolean(item?.viewed));

    if (!wasCompleted && allLecturesViewed) {
      progress.completed = true;
      progress.completionDate = now;
    }

    await progress.save();

    // Side-effects for the activity feed. Keep best-effort and avoid duplicates.
    if (!wasCompleted && allLecturesViewed) {
      Activity.create({
        userId,
        type: "COURSE_COMPLETE",
        courseId,
        courseTitle: course.title,
        metadata: { completionDate: progress.completionDate },
      }).catch((activityError) => {
        console.error("Activity log failed:", activityError);
      });
    } else if (!wasViewed) {
      const progressPercent =
        totalLectures > 0 ? Math.round((viewedCount / totalLectures) * 100) : 0;
      Activity.create({
        userId,
        type: "LECTURE_VIEW",
        courseId,
        courseTitle: course.title,
        lectureId,
        lectureTitle: lecture?.title || "Unknown Lecture",
        metadata: { progressPercent },
      }).catch((activityError) => {
        console.error("Activity log failed:", activityError);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      progress,
    });
  } catch (error) {
    console.error("Error in markCurrentLectureAsViewed:", error);
    return res.status(500).json({
      success: false,
      message: "Error marking current lecture as viewed",
    });
  }
};

const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    if (!ensureSelfOrAdmin(req, userId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const studentCoursesDoc = await StudentCourses.findOne({ userId }).lean();
    const isPurchased = hasPurchasedCourse(studentCoursesDoc, courseId);

    if (!isPurchased) {
      return res.status(200).json({
        success: true,
        isPurchased: false,
        message: "You need to purchase this course to access it",
      });
    }

    const [courseDetails, currentUserCourseProgress] = await Promise.all([
      Course.findById(courseId),
      CourseProgress.findOne({ userId, courseId }),
    ]);

    if (!courseDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress?.lecturesProgress?.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        courseDetails,
        progress: [],
        isPurchased: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "",
      courseDetails,
      currentUserCourseProgress,
      progress: currentUserCourseProgress?.lecturesProgress,
      isCompleted: currentUserCourseProgress?.completed,
      completionDate: currentUserCourseProgress?.completionDate,
      isPurchased: true,
    });
  } catch (error) {
    console.error("Error fetching current course progress:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching current course progress",
    });
  }
};

const resetCurrentCourseProgress = async (req, res) => {
  try {
    const userId = String(req.user?._id || "");
    const courseId = String(req.body?.courseId || "").trim();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Course progress not found" });
    }

    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress has been reset",
      progress,
    });
  } catch (error) {
    console.error("Error resetting course progress:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting course progress",
    });
  }
};

module.exports = {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
};
