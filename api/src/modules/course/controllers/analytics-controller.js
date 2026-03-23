const Course = require("../../../models/course");
const Order = require("../../../models/Order");
const Review = require("../../../models/review");

const getInstructorAnalytics = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { range = "6m" } = req.query;

    let startDate = new Date();
    if (range === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === "6m") {
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1); // Start from 1st of the month
    } else if (range === "1y") {
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setDate(1);
    }
    
    startDate.setHours(0, 0, 0, 0);

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

    // 2. Total Students (Unique scholars across all courses)
    const studentsResult = await Course.aggregate([
      { $match: { instructorId: String(instructorId) } },
      { $unwind: "$students" },
      { $group: { _id: "$students.studentId" } },
      { $count: "totalStudents" }
    ]);

    const totalStudents = studentsResult.length > 0 ? studentsResult[0].totalStudents : 0;

    // 3. Average Rating
    const instructorCoursesList = await Course.find({ instructorId: String(instructorId) }).select("_id");
    const courseIds = instructorCoursesList.map(c => c._id);

    const ratingResult = await Review.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const avgRating = ratingResult.length > 0 ? parseFloat(ratingResult[0].avgRating.toFixed(1)) : 0;

    // 4. Monthly Revenue Aggregation
    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          instructorId: String(instructorId),
          paymentStatus: "paid",
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: { $toDouble: "$coursePricing" } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format monthly data and fill missing months
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthlyRevenue = [];
    let current = new Date(startDate);
    const end = new Date();

    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const data = monthlyRevenueResult.find(r => r._id.year === year && r._id.month === month);
      
      monthlyRevenue.push({
        label: monthNames[current.getMonth()],
        revenue: data ? data.revenue : 0
      });

      current.setMonth(current.getMonth() + 1);
    }

    // 5. Per Course Analytics
    const courses = await Course.find({ instructorId: String(instructorId) });
    const orders = await Order.find({
      instructorId: String(instructorId),
      paymentStatus: "paid",
    });

    const revenuePerCourse = courses.map((course) => ({
      courseId: course._id,
      title: course.title,
      students: course.students ? course.students.length : 0,
      revenue: orders
        .filter((o) => String(o.courseId) === String(course._id))
        .reduce((sum, o) => sum + (parseFloat(o.coursePricing) || 0), 0),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalStudents,
        avgRating,
        totalCourses: courses.length,
        revenuePerCourse,
        monthlyRevenue
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching analytics" });
  }
};

const getInstructorRevenue = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const orders = await Order.find({
      instructorId,
      paymentStatus: "paid",
    }).sort({
      createdAt: -1,
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (parseFloat(o.coursePricing) || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      totalRevenue,
      orders,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching revenue" });
  }
};

const getInstructorStudents = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const courses = await Course.find({ instructorId });

    const students = [];
    courses.forEach((course) => {
      if (course.students && course.students.length) {
        course.students.forEach((s) => {
          students.push({
            ...s.toObject(),
            courseId: course._id,
            courseTitle: course.title,
          });
        });
      }
    });

    return res.status(200).json({
      success: true,
      totalStudents: students.length,
      students,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching students" });
  }
};

module.exports = {
  getInstructorAnalytics,
  getInstructorRevenue,
  getInstructorStudents,
};
