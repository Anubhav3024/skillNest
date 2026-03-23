const Review = require("../../../models/review");
const Course = require("../../../models/course");

const addReview = async (req, res) => {
  try {
    const { courseId, rating, reviewText } = req.body;
    const userId = req.user?._id;
    const userName = req.user?.userName;

    if (!courseId || !reviewText || !String(reviewText).trim()) {
      return res.status(400).json({
        success: false,
        message: "courseId and reviewText are required",
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

    const newReview = new Review({
      courseId,
      userId,
      userName,
      rating: numericRating,
      reviewText,
    });

    await newReview.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
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

    const reviews = await Review.find({ courseId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
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
