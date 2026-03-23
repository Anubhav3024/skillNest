const router = require("express").Router();
const {
  getCoursesByStudentId,
} = require("../controllers/student-courses-controller");
const { authenticate } = require("../../../middlewares/auth-middleware");

router.get("/get/:studentId", authenticate, getCoursesByStudentId);
 
module.exports = router;
