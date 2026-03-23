const express = require("express");
const {
  getSummary,
  getTrajectory,
  getCourseBreakdown,
  getTransactions,
  exportReport
} = require("../controllers/analytics-controller");
const { createCheckoutSession, handleWebhook } = require("../controllers/stripe-controller");
const { authenticate, checkRole } = require("../../../middlewares/auth-middleware");

const router = express.Router();

// Stripe Checkout (Student side, but part of analytics ecosystem)
router.post("/checkout", authenticate, createCheckoutSession);

// Stripe Webhook (No auth, secure by signature)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

router.get("/summary", authenticate, checkRole("instructor"), getSummary);
router.get("/trajectory", authenticate, checkRole("instructor"), getTrajectory);
router.get("/course-breakdown", authenticate, checkRole("instructor"), getCourseBreakdown);
router.get("/transactions", authenticate, checkRole("instructor"), getTransactions);
router.get("/export", authenticate, checkRole("instructor"), exportReport);

module.exports = router;
