const express = require("express");
const { authenticate } = require("../../../middlewares/auth-middleware");
const { getStudentDashboard } = require("../controllers/student-dashboard-controller");
const router = express.Router();

router.get("/:userId", authenticate, getStudentDashboard);

module.exports = router;
