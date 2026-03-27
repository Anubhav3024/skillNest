const express = require("express");
const {
  getSummary,
  getTrajectory,
  getCourseBreakdown,
  getTransactions,
  exportReport,
  createExportLink,
  exportReportPublic,
  getVaultDetailedAnalytics
} = require("../controllers/analytics-controller");
const { authenticate, checkRole } = require("../../../middlewares/auth-middleware");

const router = express.Router();

router.get("/summary", authenticate, checkRole("instructor"), getSummary);
router.get("/trajectory", authenticate, checkRole("instructor"), getTrajectory);
router.get("/course-breakdown", authenticate, checkRole("instructor"), getCourseBreakdown);
router.get("/vault/:courseId", authenticate, checkRole("instructor"), getVaultDetailedAnalytics);
router.get("/transactions", authenticate, checkRole("instructor"), getTransactions);
router.get("/export", authenticate, checkRole("instructor"), exportReport);
router.post("/export-link", authenticate, checkRole("instructor"), createExportLink);
router.get("/export-public", exportReportPublic);

module.exports = router;
