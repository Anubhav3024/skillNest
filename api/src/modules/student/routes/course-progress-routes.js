const router = require("express").Router();

const {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
} = require("../controllers/course-progress-controller");
const { authenticate } = require("../../../middlewares/auth-middleware");

router.get("/get/:userId/:courseId", getCurrentCourseProgress);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/reset-progress", resetCurrentCourseProgress);

module.exports = router;
