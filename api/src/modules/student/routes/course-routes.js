const router = require("express").Router();

const {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
} = require("../controllers/course-controllers");
const { authenticate } = require("../../../middlewares/auth-middleware");

router.get("/get", getAllStudentViewCourses);
router.get("/get/details/:id", getStudentViewCourseDetails);
router.get("/purchase-info/:id/:studentId", authenticate, checkCoursePurchaseInfo);

module.exports = router;
