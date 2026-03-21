const router = require("express").Router();
const {
  addReview,
  getReviews,
} = require("../../controllers/student-controllers/review-controller");
const { authenticate } = require("../../middleware/auth-middleware");

router.post("/add", authenticate, addReview);
router.get("/get/:courseId", getReviews);

module.exports = router;
