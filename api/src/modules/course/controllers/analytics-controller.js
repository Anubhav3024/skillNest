const Course = require("../../../models/course");
const Order = require("../../../models/Order");

const getInstructorAnalytics = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const courses = await Course.find({ instructorId });

    const orders = await Order.find({
      instructorId,
      paymentStatus: "paid",
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (parseFloat(o.coursePricing) || 0),
      0,
    );

    const totalStudents = courses.reduce(
      (sum, c) => sum + (c.students ? c.students.length : 0),
      0,
    );

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
      analytics: {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue,
        revenuePerCourse,
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
