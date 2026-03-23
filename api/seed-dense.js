const mongoose = require("mongoose");
require("dotenv").config();
const Course = require("./src/models/course");
const User = require("./src/models/user");
const Order = require("./src/models/Order");
const Review = require("./src/models/review");
const StudentCourses = require("./src/models/student-courses");

const INSTRUCTOR_ID = "69c02aae0058b23525dcd11d";
const INSTRUCTOR_NAME = "educator1";

// We'll use more students for a denser feel
const STUDENTS = [
  { id: "69b17eb89a45f6b97204ec41", name: "anu1", email: "whitewolf92912@gmail.com" },
  { id: "69b18167e8196c2634c2f769", name: "teststudent", email: "teststudent@gmail.com" },
  { id: "69b2ba21bf9e45d401ed26b6", name: "dbg_1773340537", email: "dbg_1773340537@test.com" },
  { id: "69b2ba65bf9e45d401ed26ba", name: "flow_1773340605", email: "flow_1773340605@test.com" },
  { id: "69b2baa123e025c7d3ef8bd8", name: "uifix_1773340666", email: "uifix_1773340666@test.com" }
];

async function seedDenseData() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for dense historical seeding...");

    // 1. Clear existing data for this instructor to avoid duplicates or messy charts
    await Order.deleteMany({ instructorId: INSTRUCTOR_ID });
    await Review.deleteMany({ courseId: { $in: (await Course.find({ instructorId: INSTRUCTOR_ID })).map(c => c._id) } });
    await Course.updateMany({ instructorId: INSTRUCTOR_ID }, { $set: { students: [] } });

    const courses = await Course.find({ instructorId: INSTRUCTOR_ID });
    if (courses.length === 0) {
      console.log("No courses found. Please run course seed first.");
      process.exit();
    }

    const now = new Date();
    let totalOrders = 0;

    // We'll seed data for the last 12 months
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date();
      monthDate.setMonth(now.getMonth() - m);
      
      // Each month will have 10-20 orders
      const ordersInMonth = Math.floor(Math.random() * 11) + 10; 

      for (let i = 0; i < ordersInMonth; i++) {
        const course = courses[Math.floor(Math.random() * courses.length)];
        const student = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
        
        // Random day in that month
        const orderDate = new Date(monthDate);
        orderDate.setDate(Math.floor(Math.random() * 28) + 1);
        orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        // Create Order
        const order = new Order({
          userId: student.id,
          userName: student.name,
          userEmail: student.email,
          orderStatus: "confirmed",
          paymentStatus: "paid",
          orderDate: orderDate,
          instructorId: INSTRUCTOR_ID,
          instructorName: INSTRUCTOR_NAME,
          courseImage: course.image,
          courseTitle: course.title,
          courseId: course._id,
          coursePricing: String(course.pricing),
          createdAt: orderDate,
          updatedAt: orderDate
        });
        await order.save();

        // Add student to Course.students array
        await Course.findByIdAndUpdate(course._id, {
          $push: {
            students: {
              studentId: student.id,
              studentName: student.name,
              studentEmail: student.email,
              paidAmount: course.pricing
            }
          }
        });

        // Add to StudentCourses
        await StudentCourses.updateOne(
          { userId: student.id },
          {
            $addToSet: {
              courses: {
                courseId: course._id,
                title: course.title,
                instructorId: INSTRUCTOR_ID,
                instructorName: INSTRUCTOR_NAME,
                dateOfPurchase: orderDate,
                courseImage: course.image
              }
            }
          },
          { upsert: true }
        );

        // Add a review (high probability)
        if (Math.random() > 0.4) {
          const review = new Review({
            courseId: course._id,
            userId: student.id,
            userName: student.name,
            rating: Math.floor(Math.random() * 2) + 4,
            reviewText: "Fantastic course! Highly recommended.",
            createdAt: orderDate
          });
          await review.save();
        }

        totalOrders++;
      }
      console.log(`Seeded month ${monthDate.getMonth() + 1}/${monthDate.getFullYear()} with ${ordersInMonth} orders.`);
    }

    console.log(`Total orders seeded: ${totalOrders}`);
    console.log("Dense historical seeding completed!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDenseData();
