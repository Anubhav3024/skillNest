const router = require("express").Router();
const mongoose = require("mongoose");
const { authenticate } = require("../../../middlewares/auth-middleware");
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notification-controller");

const validateNotificationId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification id",
    });
  }
  return next();
};

router.get("/", authenticate, getMyNotifications);
router.patch("/read-all", authenticate, markAllNotificationsRead);
router.patch(
  "/:id/read",
  authenticate,
  validateNotificationId,
  markNotificationRead,
);

module.exports = router;
