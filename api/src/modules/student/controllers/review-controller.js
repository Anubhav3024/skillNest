const Review = require("../../../models/review");
const Course = require("../../../models/course");
const StudentCourses = require("../../../models/student-courses");
const { createNotification } = require("../../../utils/notification-service");

const addReview = async (req, res) => {
  try {
    const { courseId, rating, reviewText } = req.body;
    const userId = req.user?._id;
    const userName = req.user?.userName;
    const trimmedReviewText = String(reviewText || "").trim();

    if (!courseId || !trimmedReviewText) {
      return res.status(400).json({
        success: false,
        message: "courseId and reviewText are required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const numericRating = Number(rating);
    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const course = await Course.findById(courseId).select(
      "_id title instructorId",
    );
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const studentCourses = await StudentCourses.findOne({
      userId: String(userId),
    });
    const hasPurchasedCourse = studentCourses?.courses?.some(
      (item) => item.courseId === String(courseId),
    );

    if (!hasPurchasedCourse) {
      return res.status(403).json({
        success: false,
        message: "Enroll in this course before contributing feedback",
      });
    }

    const existingReview = await Review.findOne({ courseId, userId }).select(
      "_id",
    );

    const review = await Review.findOneAndUpdate(
      { courseId, userId },
      {
        $set: {
          userName,
          rating: numericRating,
          reviewText: trimmedReviewText,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (course.instructorId && String(course.instructorId) !== String(userId)) {
      try {
        await createNotification({
          recipientId: course.instructorId,
          recipientRole: "instructor",
          senderId: userId,
          senderName: userName,
          title: existingReview ? "Feedback updated" : "New feedback received",
          message: existingReview
            ? `${userName} updated feedback for "${course.title}".`
            : `${userName} shared new feedback for "${course.title}".`,
          type: "FEEDBACK",
          courseId: course._id,
          entityType: "review",
          entityId: String(review._id),
          link: "/instructor?tab=students",
          metadata: {
            courseTitle: course.title,
            rating: numericRating,
            reviewText: trimmedReviewText,
          },
        });
      } catch (notificationError) {
        console.error("Review notification failed:", notificationError);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Feedback saved successfully",
      review,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getReviewsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const currentUserId = req.user?._id;

    const reviews = await Review.find({ courseId }).sort({ createdAt: -1 });
    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1),
        )
      : 0;

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((review) => review.rating === star).length,
    }));

    const currentUserReview = currentUserId
      ? reviews.find(
          (review) => String(review.userId) === String(currentUserId),
        ) || null
      : null;

    return res.status(200).json({
      success: true,
      reviews,
      summary: {
        totalReviews,
        averageRating,
        ratingBreakdown,
      },
      currentUserReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { addReview, getReviewsByCourseId };
