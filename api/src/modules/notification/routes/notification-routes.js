const router = require("express").Router();
const { authenticate } = require("../../../middlewares/auth-middleware");
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notification-controller");

router.get("/", authenticate, getMyNotifications);
router.patch("/read-all", authenticate, markAllNotificationsRead);
router.patch("/:id/read", authenticate, markNotificationRead);

module.exports = router;
