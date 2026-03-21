const {
  addNewCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
  deleteCourse,
  reorderLectures,
} = require("../../controllers/instructor-controllers/course-contollers");
const { authenticate, checkRole } = require("../../middleware/auth-middleware");

const router = require("express").Router();

router.post("/add", authenticate, checkRole("instructor"), addNewCourse);
router.get("/get/:instructorId", getAllCourses);
router.get("/get/details/:id", getCourseDetailsById);
router.put(
  "/update/:id",
  authenticate,
  checkRole("instructor"),
  updateCourseById,
);
router.delete(
  "/delete/:id",
  authenticate,
  checkRole("instructor"),
  deleteCourse,
);
router.put(
  "/reorder-lectures/:id",
  authenticate,
  checkRole("instructor"),
  reorderLectures,
);

module.exports = router;
