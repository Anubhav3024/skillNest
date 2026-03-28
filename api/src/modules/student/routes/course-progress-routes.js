const router = require("express").Router();

const {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
} = require("../controllers/course-progress-controller");
const { authenticate } = require("../../../middlewares/auth-middleware");

router.get("/get/:userId/:courseId", authenticate, getCurrentCourseProgress);
router.post("/mark-lecture-viewed", authenticate, markCurrentLectureAsViewed);
router.post("/reset-progress", authenticate, resetCurrentCourseProgress);

module.exports = router;
