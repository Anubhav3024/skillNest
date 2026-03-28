const razorpay = require("../../../utils/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../../../models/Order");
const Course = require("../../../models/course");
const User = require("../../../models/user");
const StudentCourses = require("../../../models/student-courses");
const Activity = require("../../../models/Activity");
const { emitToInstructor } = require("../../../utils/socket-service");
const Transaction = require("../../../models/Transaction");
const { createNotification } = require("../../../utils/notification-service");

const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Payment service is not configured",
      });
    }

    const { courseId } = req.body;

    const userId = req.user?._id;
    const userName = req.user?.userName;
    const userEmail = req.user?.userEmail;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "User and course are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const instructorId = course.instructorId;
    const instructorName = course.instructorName;
    const courseImage = course.image;
    const courseTitle = course.title;
    const coursePricing = Number(course.pricing);
    if (!Number.isFinite(coursePricing) || coursePricing <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid course pricing. Please set a valid price before purchase.",
      });
    }

    // Check for duplicate order or multiple clicks
    const existingOrder = await Order.findOne({
      userId,
      courseId,
    });

    if (existingOrder && existingOrder.paymentStatus === "paid") {
      return res.status(200).json({
        success: false,
        message: "You have already purchased this course.",
      });
    }

    const rawReceipt = `rcpt_${Date.now().toString(36)}_${String(userId).slice(-6)}`;
    const receipt =
      rawReceipt.length > 40 ? rawReceipt.slice(0, 40) : rawReceipt;

    const options = {
      amount: Math.round(coursePricing * 100),
      currency: "INR",
      receipt,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({
        success: false,
        message: "Error creating Razorpay order",
      });
    }

    const newlyCreatedCourseOrder = new Order({
      userId,
      userName,
      userEmail,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "initiated",
      orderDate: new Date(),
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
      razorpayOrderId: razorpayOrder.id,
    });

    await newlyCreatedCourseOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      result: {
        razorpayOrderId: razorpayOrder.id,
        orderId: newlyCreatedCourseOrder._id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    const status = error?.statusCode || 500;
    const message =
      error?.error?.description ||
      error?.error?.reason ||
      error?.message ||
      "Error creating Razorpay order";
    console.error("Error creating order:", error);
    res.status(status).json({
      success: false,
      message,
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Payment verification is not configured",
      });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      String(order.userId) !== String(req.user?._id) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (order.paymentStatus === "paid" || order.orderStatus === "confirmed") {
      return res.status(200).json({
        success: true,
        message: "Order already confirmed",
        order,
      });
    }

    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order mismatch. Please retry payment.",
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    let processed = false;
    let updatedOrder = null;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        updatedOrder = await Order.findOneAndUpdate(
          { _id: order._id, paymentStatus: { $ne: "paid" } },
          {
            $set: {
              paymentStatus: "paid",
              orderStatus: "confirmed",
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
            },
          },
          { new: true, session },
        );

        if (!updatedOrder) {
          return;
        }

        processed = true;

        await StudentCourses.updateOne(
          { userId: updatedOrder.userId },
          {
            $addToSet: {
              courses: {
                courseId: updatedOrder.courseId,
                title: updatedOrder.courseTitle,
                instructorId: updatedOrder.instructorId,
                instructorName: updatedOrder.instructorName,
                dateOfPurchase: updatedOrder.orderDate,
                courseImage: updatedOrder.courseImage,
              },
            },
          },
          { upsert: true, session },
        );

        await Course.findByIdAndUpdate(
          updatedOrder.courseId,
          {
            $addToSet: {
              students: {
                studentId: updatedOrder.userId,
                studentName: updatedOrder.userName,
                studentEmail: updatedOrder.userEmail,
                paidAmount: updatedOrder.coursePricing,
              },
            },
          },
          { session },
        );

        // 💰 Create Transaction Record (90/10 Split)
        const platformFee = Number(
          (updatedOrder.coursePricing * 0.1).toFixed(2),
        );
        const instructorShare = Number(
          (updatedOrder.coursePricing * 0.9).toFixed(2),
        );

        const instructor = await User.findById(
          updatedOrder.instructorId,
        ).session(session);
        const existingTx = await Transaction.findOne({
          orderId: updatedOrder._id,
        }).session(session);

        if (!existingTx) {
          const transaction = new Transaction({
            orderId: updatedOrder._id,
            studentId: updatedOrder.userId,
            instructorId: updatedOrder.instructorId,
            courseId: updatedOrder.courseId,
            totalAmount: updatedOrder.coursePricing,
            platformFee,
            instructorShare,
            payoutStatus: "pending",
            payoutDetails: {
              upiId: instructor?.upiId || "",
              bankDetails: instructor?.bankDetails || {},
            },
          });

          await transaction.save({ session });
        }
      });
    } finally {
      session.endSession();
    }

    if (!processed) {
      const latestOrder = await Order.findById(order._id);
      return res.status(200).json({
        success: true,
        message: "Order already confirmed",
        order: latestOrder || order,
      });
    }

    const finalOrder = updatedOrder || order;

    // Emit real-time notification to instructor
    emitToInstructor(String(finalOrder.instructorId), "dashboard-update", {
      orderId: finalOrder._id,
      courseTitle: finalOrder.courseTitle,
      amount: finalOrder.coursePricing,
      userName: finalOrder.userName,
      message: `New enrollment for "${finalOrder.courseTitle}" by ${finalOrder.userName}! 🥂`,
    });

    try {
      await createNotification({
        recipientId: finalOrder.instructorId,
        recipientRole: "instructor",
        senderId: finalOrder.userId,
        senderName: finalOrder.userName,
        title: "New paid enrollment",
        message: `${finalOrder.userName} enrolled in "${finalOrder.courseTitle}" and completed payment.`,
        type: "PAYMENT",
        courseId: finalOrder.courseId,
        entityType: "order",
        entityId: String(finalOrder._id),
        link: "/instructor?tab=earnings",
        metadata: {
          courseTitle: finalOrder.courseTitle,
          amount: finalOrder.coursePricing,
        },
      });
    } catch (notificationError) {
      console.error("Payment notification side-effect failed", {
        orderId: String(finalOrder._id),
        userId: String(finalOrder.userId),
        error: notificationError.message,
      });
    }
    // 🎓 Log Course Enrollment Activity
    try {
      await Activity.create({
        userId: finalOrder.userId,
        type: "COURSE_ENROLL",
        courseId: finalOrder.courseId,
        courseTitle: finalOrder.courseTitle,
        metadata: { orderId: finalOrder._id, amount: finalOrder.coursePricing },
      });
    } catch (activityError) {
      console.error("Activity side-effect failed", {
        orderId: String(finalOrder._id),
        userId: String(finalOrder.userId),
        error: activityError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order confirmed",
      order: finalOrder,
    });
  } catch (error) {
    console.error("Error capturing payment:", error);
    return res.status(500).json({
      success: false,
      message: "Error capturing payment via order controllers",
    });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      String(req.user?._id) !== String(userId) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching order history" });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET");
      return res.status(500).json({
        success: false,
        message: "Webhook secret not configured",
      });
    }

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature",
      });
    }

    if (!req.rawBody) {
      return res.status(400).json({
        success: false,
        message: "Missing raw webhook payload",
      });
    }

    const rawBody = Buffer.isBuffer(req.rawBody)
      ? req.rawBody.toString()
      : String(req.rawBody);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const signatureBuffer = Buffer.from(String(signature), "hex");

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const paymentId = req.body.payload.payment.entity.id;
      const orderId = req.body.payload.payment.entity.order_id;

      const order = await Order.findOne({ razorpayOrderId: orderId });

      if (!order) {
        return res.status(200).json({ success: true });
      }

      if (order.paymentStatus === "paid") {
        return res.status(200).json({ success: true });
      }

      let processed = false;
      let updatedOrder = null;
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          updatedOrder = await Order.findOneAndUpdate(
            { _id: order._id, paymentStatus: { $ne: "paid" } },
            {
              $set: {
                paymentStatus: "paid",
                orderStatus: "confirmed",
                razorpayPaymentId: paymentId,
              },
            },
            { new: true, session },
          );

          if (!updatedOrder) {
            return;
          }

          processed = true;

          await StudentCourses.updateOne(
            { userId: updatedOrder.userId },
            {
              $addToSet: {
                courses: {
                  courseId: updatedOrder.courseId,
                  title: updatedOrder.courseTitle,
                  instructorId: updatedOrder.instructorId,
                  instructorName: updatedOrder.instructorName,
                  dateOfPurchase: updatedOrder.orderDate,
                  courseImage: updatedOrder.courseImage,
                },
              },
            },
            { upsert: true, session },
          );

          await Course.findByIdAndUpdate(
            updatedOrder.courseId,
            {
              $addToSet: {
                students: {
                  studentId: updatedOrder.userId,
                  studentName: updatedOrder.userName,
                  studentEmail: updatedOrder.userEmail,
                  paidAmount: updatedOrder.coursePricing,
                },
              },
            },
            { session },
          );

          // 💰 Create Transaction Record (90/10 Split)
          const platformFee = Number(
            (updatedOrder.coursePricing * 0.1).toFixed(2),
          );
          const instructorShare = Number(
            (updatedOrder.coursePricing * 0.9).toFixed(2),
          );

          const instructor = await User.findById(
            updatedOrder.instructorId,
          ).session(session);
          const existingTx = await Transaction.findOne({
            orderId: updatedOrder._id,
          }).session(session);

          if (!existingTx) {
            const transaction = new Transaction({
              orderId: updatedOrder._id,
              studentId: updatedOrder.userId,
              instructorId: updatedOrder.instructorId,
              courseId: updatedOrder.courseId,
              totalAmount: updatedOrder.coursePricing,
              platformFee,
              instructorShare,
              payoutStatus: "pending",
              payoutDetails: {
                upiId: instructor?.upiId || "",
                bankDetails: instructor?.bankDetails || {},
              },
            });

            await transaction.save({ session });
          }
        });
      } finally {
        session.endSession();
      }

      if (processed) {
        const finalOrder = updatedOrder || order;
        // Emit real-time notification to instructor
        emitToInstructor(String(finalOrder.instructorId), "dashboard-update", {
          orderId: finalOrder._id,
          courseTitle: finalOrder.courseTitle,
          amount: finalOrder.coursePricing,
          userName: finalOrder.userName,
          message: `New enrollment for "${finalOrder.courseTitle}" by ${finalOrder.userName}! 🥂 (Webhook)`,
        });

        try {
          await createNotification({
            recipientId: finalOrder.instructorId,
            recipientRole: "instructor",
            senderId: finalOrder.userId,
            senderName: finalOrder.userName,
            title: "New paid enrollment",
            message: `${finalOrder.userName} enrolled in "${finalOrder.courseTitle}" and payment was captured.`,
            type: "PAYMENT",
            courseId: finalOrder.courseId,
            entityType: "order",
            entityId: String(finalOrder._id),
            link: "/instructor?tab=earnings",
            metadata: {
              courseTitle: finalOrder.courseTitle,
              amount: finalOrder.coursePricing,
              source: "webhook",
            },
          });
        } catch (notificationError) {
          console.error("Webhook notification side-effect failed", {
            orderId: String(finalOrder._id),
            error: notificationError.message,
          });
        }
        // 🎓 Log Course Enrollment Activity
        try {
          await Activity.create({
            userId: finalOrder.userId,
            type: "COURSE_ENROLL",
            courseId: finalOrder.courseId,
            courseTitle: finalOrder.courseTitle,
            metadata: {
              orderId: finalOrder._id,
              amount: finalOrder.coursePricing,
              source: "webhook",
            },
          });
        } catch (activityError) {
          console.error("Webhook activity side-effect failed", {
            orderId: String(finalOrder._id),
            error: activityError.message,
          });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Webhook processing failed" });
  }
};

const getStudentTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      String(req.user?._id) !== String(userId) &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const transactions = await Transaction.find({ studentId: userId })
      .populate("courseId", "title image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching student transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching student transactions",
    });
  }
};

module.exports = {
  createOrder,
  capturePaymentAndFinalizeOrder,
  getOrderHistory,
  getStudentTransactions,
  handleWebhook,
};
