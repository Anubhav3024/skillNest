const express = require("express");
const {
  updateUserProfile,
  changePassword,
  getUserProfile,
  getEnrolledCourses,
  getPaymentHistory,
  deleteAccount,
  updateUserSettings,
} = require("../user.controller");
const { authenticate } = require("../../../middlewares/auth-middleware");

const router = express.Router();

router.get("/profile", authenticate, getUserProfile);
router.put("/update", authenticate, updateUserProfile);
router.put("/settings/update", authenticate, updateUserSettings);
router.put("/change-password", authenticate, changePassword);
router.get("/enrolled-courses/:userId", authenticate, getEnrolledCourses);
router.get("/payment-history/:userId", authenticate, getPaymentHistory);
router.delete("/delete/:userId", authenticate, deleteAccount);
// Backwards-compatible alias used by older client builds
router.delete("/delete-account/:userId", authenticate, deleteAccount);

module.exports = router;
