const Order = require("../../../models/Order");
const Course = require("../../../models/course");
const Review = require("../../../models/review");
const StudentCourses = require("../../../models/student-courses");
const mongoose = require("mongoose");

// Helper to format stability (retention %)
const calculateStability = (active, total) => {
  if (total === 0) return 100;
  return parseFloat(((active / total) * 100).toFixed(2));
};

const getSummary = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // 1. Total Revenue (Sum of paid orders)
    const revenueResult = await Order.aggregate([
      { 
        $match: { 
          instructorId: String(instructorId), 
          paymentStatus: "paid" 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: { $toDouble: "$coursePricing" } } 
        } 
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // 2. Total Students (Unique scholars across all courses of this instructor)
    const studentsResult = await Order.aggregate([
      { $match: { instructorId: String(instructorId), paymentStatus: "paid" } },
      { $group: { _id: "$userId" } },
      { $count: "totalStudents" }
    ]);

    const totalStudents = studentsResult.length > 0 ? studentsResult[0].totalStudents : 0;

    // 3. Average Rating
    const instructorCourses = await Course.find({ instructorId: String(instructorId) }).select("_id");
    const courseIds = instructorCourses.map(c => c._id);

    const ratingResult = await Review.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const avgRating = ratingResult.length > 0 ? parseFloat(ratingResult[0].avgRating.toFixed(1)) : 0;

    // 4. Stability (Retention)
    // For this context, we consider stability as (students who haven't asked for refund / total)
    // Or more simply, since we don't have a 'dropped' status yet, we'll use a mock ratio or based on activity if available.
    // Let's assume stability based on active enrollment vs total historical purchases.
    const stability = totalStudents > 0 ? 98.5 : 100; // Mock high stability for now or use a dynamic logic if status is added.

    res.status(200).json({
      success: true,
      data: {
        revenue: totalRevenue,
        totalStudents,
        avgRating,
        stability
      }
    });
  } catch (error) {
    console.error("Analytics Summary Error:", error);
    res.status(500).json({ success: false, message: "Error calculating summary" });
  }
};

const getTrajectory = async (req, res) => {
  try {
    const { type = "monthly" } = req.query;
    const instructorId = req.user._id;

    let groupBy;
    if (type === "weekly") {
      groupBy = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" }
      };
    } else if (type === "yearly") {
      groupBy = { year: { $year: "$createdAt" } };
    } else {
      // default monthly
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      };
    }

    const trajectory = await Order.aggregate([
      {
        $match: {
          instructorId: String(instructorId),
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: { $toDouble: "$coursePricing" } },
          date: { $first: "$createdAt" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
    ]);

    // Format for frontend
    const formatted = trajectory.map(item => ({
      period: item.date, // Will be used to format label on frontend
      revenue: item.revenue,
      rawId: item._id
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Trajectory Error:", error);
    res.status(500).json({ success: false, message: "Error fetching trajectory" });
  }
};

const getCourseBreakdown = async (req, res) => {
  try {
    const { period } = req.query; // Expecting YYYY-MM
    const instructorId = req.user._id;

    if (!period) return res.status(400).json({ success: false, message: "Period required" });

    const [year, month] = period.split("-").map(Number);

    const breakdown = await Order.aggregate([
      {
        $match: {
          instructorId: String(instructorId),
          paymentStatus: "paid",
          $expr: {
            $and: [
              { $eq: [{ $year: "$createdAt" }, year] },
              { $eq: [{ $month: "$createdAt" }, month] }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$courseId",
          title: { $first: "$courseTitle" },
          revenue: { $sum: { $toDouble: "$coursePricing" } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    console.error("Breakdown Error:", error);
    res.status(500).json({ success: false, message: "Error fetching breakdown" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const transactions = await Order.find({ instructorId: String(instructorId) })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Transactions Error:", error);
    res.status(500).json({ success: false, message: "Error fetching transactions" });
  }
};

const exportReport = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const orders = await Order.find({ 
      instructorId: String(instructorId), 
      paymentStatus: "paid" 
    }).sort({ createdAt: -1 });

    let csv = "Date,StudentName,Course,Amount,Status\n";
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      csv += `${date},"${order.userName}","${order.courseTitle}",${order.coursePricing},${order.paymentStatus}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("revenue-manifest.csv");
    res.send(csv);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ success: false, message: "Error exporting report" });
  }
};

const getVaultDetailedAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    const course = await Course.findOne({ _id: courseId, instructorId: String(instructorId) });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 1. Student Progress & List
    const enrollments = await Order.find({ 
      courseId: String(courseId), 
      paymentStatus: "paid" 
    }).select("userId userName userEmail createdAt coursePricing");

    // 2. Revenue Breakdown (Monthly)
    const revenueBreakdown = await Order.aggregate([
      { 
        $match: { 
          courseId: String(courseId), 
          paymentStatus: "paid" 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: { $toDouble: "$coursePricing" } },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
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
          totalRevenue: revenueBreakdown.reduce((acc, curr) => acc + curr.revenue, 0),
          stabilityScore: parseFloat(stabilityScore.toFixed(2)),
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
        revenueBreakdown,
        students: enrollments
      }
    });
  } catch (error) {
    console.error("Vault Analytics Error:", error);
    res.status(500).json({ success: false, message: "Error fetching vault analytics" });
  }
};

module.exports = {
  getSummary,
  getTrajectory,
  getCourseBreakdown,
  getTransactions,
  exportReport,
  getVaultDetailedAnalytics
};
