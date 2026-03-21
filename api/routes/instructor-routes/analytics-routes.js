const router = require("express").Router();
const {
  getInstructorAnalytics,
  getInstructorRevenue,
  getInstructorStudents,
} = require("../../controllers/instructor-controllers/analytics-controller");
const { authenticate, checkRole } = require("../../middleware/auth-middleware");

const checkInstructorOwnership = (req, res, next) => {
  if (String(req.user?._id) !== String(req.params.instructorId)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  return next();
};

router.get(
  "/analytics/:instructorId",
  authenticate,
  checkRole("instructor"),
  checkInstructorOwnership,
  getInstructorAnalytics,
);
router.get(
  "/revenue/:instructorId",
  authenticate,
  checkRole("instructor"),
  checkInstructorOwnership,
  getInstructorRevenue,
);
router.get(
  "/students/:instructorId",
  authenticate,
  checkRole("instructor"),
  checkInstructorOwnership,
  getInstructorStudents,
);

module.exports = router;
