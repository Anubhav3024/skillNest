const Order = require("../../../models/Order");
const Course = require("../../../models/course");
const Review = require("../../../models/review");
const StudentCourses = require("../../../models/student-courses");
const Transaction = require("../../../models/Transaction");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Helper to format stability (retention %)
const calculateStability = (active, total) => {
  if (total === 0) return 100;
  return parseFloat(((active / total) * 100).toFixed(2));
};

const orderPriceExpr = {
  $convert: { input: "$coursePricing", to: "double", onError: 0, onNull: 0 },
};

const getInstructorObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

const buildOrderMatch = (instructorId, excludeOrderIds = []) => {
  const match = {
    instructorId: String(instructorId),
    paymentStatus: "paid",
  };

  if (excludeOrderIds.length) {
    match._id = { $nin: excludeOrderIds };
  }

  return match;
};

const buildPeriodDate = (rawId, type) => {
  if (!rawId || !rawId.year) return new Date();

  if (type === "weekly") {
    const week = Number(rawId.week || 1);
    return new Date(Date.UTC(Number(rawId.year), 0, 1 + (week - 1) * 7));
  }

  if (type === "yearly") {
    return new Date(Date.UTC(Number(rawId.year), 0, 1));
  }

  const month = Number(rawId.month || 1);
  return new Date(Date.UTC(Number(rawId.year), month - 1, 1));
};

const mergeTrajectoryBuckets = (items, type) => {
  const buckets = new Map();

  items.forEach((item) => {
    if (!item || !item._id) return;
    const year = item._id.year || 0;
    const month = item._id.month || 0;
    const week = item._id.week || 0;
    const key = `${year}-${month}-${week}`;

    const revenueValue = Number(item.revenue || 0);
    const existing = buckets.get(key);

    if (existing) {
      existing.revenue += revenueValue;
      return;
    }

    buckets.set(key, {
      rawId: item._id,
      revenue: revenueValue,
      period: buildPeriodDate(item._id, type),
    });
  });

  const sorted = Array.from(buckets.values()).sort((a, b) => {
    const ay = a.rawId.year || 0;
    const by = b.rawId.year || 0;
    if (ay !== by) return ay - by;

    const am = a.rawId.month || 0;
    const bm = b.rawId.month || 0;
    if (am !== bm) return am - bm;

    const aw = a.rawId.week || 0;
    const bw = b.rawId.week || 0;
    return aw - bw;
  });

  return sorted.map((item) => ({
    period: item.period,
    revenue: Number(item.revenue.toFixed(2)),
    rawId: item.rawId,
  }));
};

const buildExportOrders = async (instructorId, courseId) => {
  const match = {
    instructorId: String(instructorId),
    paymentStatus: "paid",
  };

  if (courseId) {
    match.courseId = String(courseId);
  }

  return Order.find(match).sort({ createdAt: -1 });
};

const sanitizeCsvCell = (value) => {
  const text = String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  return /^[=+\-@]/.test(escaped) ? `'${escaped}` : escaped;
};

const buildExportCsv = (orders) => {
  let csv = "Date,StudentName,Course,Amount,Status\n";
  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    csv += `"${sanitizeCsvCell(date)}","${sanitizeCsvCell(order.userName)}","${sanitizeCsvCell(order.courseTitle)}","${sanitizeCsvCell(order.coursePricing)}","${sanitizeCsvCell(order.paymentStatus)}"\n`;
  });
  return csv;
};

const getSummary = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const instructorObjectId = getInstructorObjectId(instructorId);

    if (!instructorObjectId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid instructor ID" });
    }

    // 1. Total Revenue (Sum of paid orders)
    // 1. Total Revenue (Sum of paid transactions - Instructor Share)
    const revenueResult = await Transaction.aggregate([
      {
        $match: {
          instructorId: instructorObjectId,
          paymentStatus: "captured",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$instructorShare" },
          totalPlatformFee: { $sum: "$platformFee" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);

    const txRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const txPlatformFee =
      revenueResult.length > 0 ? revenueResult[0].totalPlatformFee : 0;
    const txSales = revenueResult.length > 0 ? revenueResult[0].totalSales : 0;

    const txOrderIds = await Transaction.distinct("orderId", {
      instructorId: instructorObjectId,
    });

    const orderRevenueResult = await Order.aggregate([
      { $match: buildOrderMatch(instructorId, txOrderIds) },
      {
        $group: {
          _id: null,
          totalSales: { $sum: orderPriceExpr },
        },
      },
    ]);

    const orderSales =
      orderRevenueResult.length > 0 ? orderRevenueResult[0].totalSales : 0;

    const totalSales = Number((txSales + orderSales).toFixed(2));
    const totalRevenue = Number((txRevenue + orderSales * 0.9).toFixed(2));
    const totalPlatformFee = Number(
      (txPlatformFee + orderSales * 0.1).toFixed(2),
    );

    // 2. Total Students (Unique scholars across all courses of this instructor)
    const studentsResult = await Order.aggregate([
      { $match: { instructorId: String(instructorId), paymentStatus: "paid" } },
      { $group: { _id: "$userId" } },
      { $count: "totalStudents" },
    ]);

    const totalStudents =
      studentsResult.length > 0 ? studentsResult[0].totalStudents : 0;

    // 3. Average Rating
    const instructorCourses = await Course.find({
      instructorId: String(instructorId),
    }).select("_id");
    const courseIds = instructorCourses.map((c) => c._id);

    const ratingResult = await Review.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const avgRating =
      ratingResult.length > 0
        ? parseFloat(ratingResult[0].avgRating.toFixed(1))
        : 0;

    // 4. Stability (Retention)
    // For this context, we consider stability as (students who haven't asked for refund / total)
    // Or more simply, since we don't have a 'dropped' status yet, we'll use a mock ratio or based on activity if available.
    // Let's assume stability based on active enrollment vs total historical purchases.
    const stability = totalStudents > 0 ? 98.5 : 100; // Mock high stability for now or use a dynamic logic if status is added.

    res.status(200).json({
      success: true,
      data: {
        revenue: totalRevenue,
        platformFee: totalPlatformFee,
        totalSales,
        totalStudents,
        avgRating,
        stability,
      },
    });
  } catch (error) {
    console.error("Analytics Summary Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error calculating summary" });
  }
};

const getTrajectory = async (req, res) => {
  try {
    const { type = "monthly" } = req.query;
    const instructorId = req.user._id;
    const instructorObjectId = getInstructorObjectId(instructorId);

    if (!instructorObjectId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid instructor ID" });
    }

    let groupBy;
    if (type === "weekly") {
      groupBy = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
    } else if (type === "yearly") {
      groupBy = { year: { $year: "$createdAt" } };
    } else {
      // default monthly
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    }

    const trajectory = await Transaction.aggregate([
      {
        $match: {
          instructorId: instructorObjectId,
          paymentStatus: "captured",
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$instructorShare" },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    const txOrderIds = await Transaction.distinct("orderId", {
      instructorId: instructorObjectId,
    });

    const orderTrajectory = await Order.aggregate([
      { $match: buildOrderMatch(instructorId, txOrderIds) },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: { $multiply: [orderPriceExpr, 0.9] } },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    const formatted = mergeTrajectoryBuckets(
      [...trajectory, ...orderTrajectory],
      type,
    );

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Trajectory Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching trajectory" });
  }
};

const getCourseBreakdown = async (req, res) => {
  try {
    const { period } = req.query; // Expecting YYYY-MM
    const instructorId = req.user._id;

    if (!period)
      return res
        .status(400)
        .json({ success: false, message: "Period required" });

    const [year, month] = period.split("-").map(Number);

    const breakdown = await Order.aggregate([
      {
        $match: {
          instructorId: String(instructorId),
          paymentStatus: "paid",
          $expr: {
            $and: [
              { $eq: [{ $year: "$createdAt" }, year] },
              { $eq: [{ $month: "$createdAt" }, month] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$courseId",
          title: { $first: "$courseTitle" },
          revenue: { $sum: { $toDouble: "$coursePricing" } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    console.error("Breakdown Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching breakdown" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const instructorObjectId = getInstructorObjectId(instructorId);

    if (!instructorObjectId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid instructor ID" });
    }

    const transactions = await Transaction.find({
      instructorId: instructorObjectId,
    })
      .populate("studentId", "userName userEmail avatar")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const normalized = transactions.map((tx) => ({
      ...tx,
      userName: tx.studentId?.userName,
      userEmail: tx.studentId?.userEmail,
      studentAvatar: tx.studentId?.avatar,
      courseTitle: tx.courseId?.title,
    }));

    if (normalized.length === 0) {
      const fallbackOrders = await Order.find(buildOrderMatch(instructorId))
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const fallback = fallbackOrders.map((order) => ({
        _id: order._id,
        createdAt: order.createdAt,
        userName: order.userName,
        userEmail: order.userEmail,
        studentAvatar: order.studentAvatar || null,
        courseTitle: order.courseTitle,
        instructorShare: Number(
          (Number(order.coursePricing || 0) * 0.9).toFixed(2),
        ),
        payoutStatus: "pending",
      }));

      return res.status(200).json({ success: true, data: fallback });
    }

    res.status(200).json({ success: true, data: normalized });
  } catch (error) {
    console.error("Transactions Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching transactions" });
  }
};

const exportReport = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { courseId } = req.query;

    const orders = await buildExportOrders(instructorId, courseId);
    const csv = buildExportCsv(orders);

    res.header("Content-Type", "text/csv");
    res.attachment("revenue-manifest.csv");
    res.send(csv);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ success: false, message: "Error exporting report" });
  }
};

const createExportLink = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "JWT secret not configured" });
    }

    const instructorId = req.user._id;
    const courseId = req.body?.courseId || req.query?.courseId || null;

    const token = jwt.sign(
      {
        purpose: "analytics_export",
        instructorId: String(instructorId),
        courseId: courseId ? String(courseId) : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/api/analytics/export-public?token=${token}`;

    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error("Export Link Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error generating export link" });
  }
};

const exportReportPublic = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "JWT secret not configured" });
    }

    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "Missing token" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    if (payload?.purpose !== "analytics_export" || !payload?.instructorId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token scope" });
    }

    const orders = await buildExportOrders(
      payload.instructorId,
      payload.courseId,
    );
    const csv = buildExportCsv(orders);

    res.header("Content-Type", "text/csv");
    res.attachment("revenue-manifest.csv");
    res.send(csv);
  } catch (error) {
    console.error("Public Export Error:", error);
    res.status(500).json({ success: false, message: "Error exporting report" });
  }
};

const getVaultDetailedAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findOne({
      _id: courseId,
      instructorId: String(instructorId),
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // 1. Student Progress & List
    const enrollments = await Order.find({
      courseId: String(courseId),
      paymentStatus: "paid",
    }).select("userId userName userEmail createdAt coursePricing");

    // 2. Revenue Breakdown (Monthly)
    const pricingExpr = {
      $convert: {
        input: "$coursePricing",
        to: "double",
        onError: 0,
        onNull: 0,
      },
    };

    const revenueBreakdown = await Order.aggregate([
      {
        $match: {
          courseId: String(courseId),
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: pricingExpr },
          enrollments: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // 3. Stability Score & Conversion (Mock logic for now as requested)
    // In a real app, this would use daily engagement logs
    const totalEnrollments = enrollments.length;
    const stabilityScore = totalEnrollments > 0 ? 85 + Math.random() * 10 : 100;
    const conversionRate = totalEnrollments > 0 ? 12.5 + Math.random() * 5 : 0;

    res.status(200).json({
      success: true,
      data: {
        course,
        stats: {
          totalStudents: totalEnrollments,
          totalRevenue: revenueBreakdown.reduce(
            (acc, curr) => acc + curr.revenue,
            0,
          ),
          stabilityScore: parseFloat(stabilityScore.toFixed(2)),
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
        revenueBreakdown,
        students: enrollments,
      },
    });
  } catch (error) {
    console.error("Vault Analytics Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching vault analytics" });
  }
};

module.exports = {
  getSummary,
  getTrajectory,
  getCourseBreakdown,
  getTransactions,
  exportReport,
  createExportLink,
  exportReportPublic,
  getVaultDetailedAnalytics,
};
