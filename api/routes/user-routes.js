const router = require("express").Router();
const {
  updateUserProfile,
  changePassword,
  getUserProfile,
  getEnrolledCourses,
  getPaymentHistory,
  deleteAccount,
} = require("../controllers/user-controller");
const { authenticate } = require("../middleware/auth-middleware");

router.get("/profile", authenticate, getUserProfile);
router.put("/update-profile", authenticate, updateUserProfile);
router.put("/change-password", authenticate, changePassword);
router.get("/enrolled-courses/:userId", authenticate, getEnrolledCourses);
router.get("/payment-history/:userId", authenticate, getPaymentHistory);
router.delete("/delete-account/:userId", authenticate, deleteAccount);

module.exports = router;
