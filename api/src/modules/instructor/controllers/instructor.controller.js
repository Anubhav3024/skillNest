const Notification = require("../../../models/Notification");
const User = require("../../../models/user");
const { getIO } = require("../../../utils/socket-service");

const broadcastMessage = async (req, res) => {
  try {
    const { studentIds, message } = req.body;
    const instructorId = req.user._id;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students selected for broadcast",
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Create notifications for each student
    const notifications = studentIds.map((studentId) => ({
      recipientId: studentId,
      senderId: instructorId,
      message: message,
      type: "BROADCAST",
    }));

    await Notification.insertMany(notifications);

    // Real-time notification via Socket.io
    const io = getIO();
    studentIds.forEach((studentId) => {
      io.to(String(studentId)).emit("new-notification", {
        message: message,
        senderName: req.user.userName,
        type: "BROADCAST",
        createdAt: new Date(),
      });
    });

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
