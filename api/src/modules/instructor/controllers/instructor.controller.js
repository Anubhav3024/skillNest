const {
  createBulkNotifications,
} = require("../../../utils/notification-service");

const broadcastMessage = async (req, res) => {
  try {
    const { studentIds, message } = req.body;
    const instructorId = req.user._id;
    const trimmedMessage = String(message || "").trim();
    const safeSenderName = req.user?.userName || "Instructor";

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students selected for broadcast",
      });
    }

    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const notifications = studentIds.map((studentId) => ({
      recipientId: studentId,
      senderId: instructorId,
      senderName: safeSenderName,
      recipientRole: "student",
      title: "New educator announcement",
      message: trimmedMessage,
      type: "BROADCAST",
      link: "/home?tab=my-courses",
    }));

    await createBulkNotifications(notifications);

    return res.status(200).json({
      success: true,
      message: `Message broadcasted to ${studentIds.length} students successfully`,
    });
  } catch (error) {
    console.error("Broadcast Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error broadcasting message",
    });
  }
};

module.exports = {
  broadcastMessage,
};
