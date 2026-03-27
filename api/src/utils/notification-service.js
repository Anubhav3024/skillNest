const Notification = require("../models/Notification");
const { emitToUser } = require("./socket-service");

const formatNotificationPayload = (notificationDoc) => ({
  _id: notificationDoc._id,
  recipientId: notificationDoc.recipientId,
  recipientRole: notificationDoc.recipientRole,
  senderId: notificationDoc.senderId,
  senderName: notificationDoc.senderName,
  title: notificationDoc.title,
  message: notificationDoc.message,
  type: notificationDoc.type,
  courseId: notificationDoc.courseId,
  entityType: notificationDoc.entityType,
  entityId: notificationDoc.entityId,
  link: notificationDoc.link,
  metadata: notificationDoc.metadata || {},
  read: notificationDoc.read,
  createdAt: notificationDoc.createdAt,
  updatedAt: notificationDoc.updatedAt,
});

const createNotification = async (payload) => {
  const notification = await Notification.create(payload);
  emitToUser(
    String(payload.recipientId),
    "new-notification",
    formatNotificationPayload(notification),
  );
  return notification;
};

const createBulkNotifications = async (payloads) => {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return [];
  }

  const notifications = await Notification.insertMany(payloads);
  notifications.forEach((notification) => {
    emitToUser(
      String(notification.recipientId),
      "new-notification",
      formatNotificationPayload(notification),
    );
  });

  return notifications;
};

module.exports = {
  createNotification,
  createBulkNotifications,
  formatNotificationPayload,
};
