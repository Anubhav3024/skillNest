const razorpay = require("../../../utils/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../../../models/Order");
const Course = require("../../../models/course");
const User = require("../../../models/user");
const StudentCourses = require("../../../models/student-courses");

const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Payment service is not configured",
      });
    }

    const { orderStatus, paymentMethod, paymentStatus, orderDate, courseId } =
      req.body;

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

    const options = {
      amount: Math.round(coursePricing * 100),
      currency: "INR",
      receipt: `receipt_order_${userId}_${courseId}_${Date.now()}`,
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
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
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
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order via order controllers",
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

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await order.save({ session });

        await StudentCourses.updateOne(
          { userId: order.userId },
          {
            $addToSet: {
              courses: {
                courseId: order.courseId,
                title: order.courseTitle,
                instructorId: order.instructorId,
                instructorName: order.instructorName,
                dateOfPurchase: order.orderDate,
                courseImage: order.courseImage,
              },
            },
          },
          { upsert: true, session },
        );

        await Course.findByIdAndUpdate(
          order.courseId,
          {
            $addToSet: {
              students: {
                studentId: order.userId,
                studentName: order.userName,
                studentEmail: order.userEmail,
                paidAmount: order.coursePricing,
              },
            },
          },
          { session },
        );
      });
    } finally {
      session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Order confirmed",
      order,
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

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
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

      await Order.findOneAndUpdate(
        { razorpayOrderId: orderId },
        {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          razorpayPaymentId: paymentId,
        },
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Webhook processing failed" });
  }
};

module.exports = {
  createOrder,
  capturePaymentAndFinalizeOrder,
  getOrderHistory,
  handleWebhook,
};
