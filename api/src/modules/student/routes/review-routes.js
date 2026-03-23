const router = require("express").Router();
const {
  addReview,
  getReviewsByCourseId,
} = require("../controllers/review-controller");
const { authenticate } = require("../../../middlewares/auth-middleware");

router.post("/add", authenticate, addReview);
router.get("/get/:courseId", getReviewsByCourseId);

module.exports = router;
