const Notification = require("../../../models/Notification");
const { formatNotificationPayload } = require("../../../utils/notification-service");

const getMyNotifications = async (req, res) => {
  try {
    const recipientId = req.user?._id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const unreadOnly = String(req.query.unreadOnly || "false") === "true";

    const query = {
      recipientId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(limit),
      Notification.countDocuments({ recipientId, read: false }),
    ]);

    return res.status(200).json({
      success: true,
      notifications: notifications.map(formatNotificationPayload),
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user?._id },
      { $set: { read: true } },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification: formatNotificationPayload(notification),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user?._id, read: false },
      { $set: { read: true } },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
