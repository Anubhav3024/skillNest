const mongoose = require("mongoose");
require("dotenv").config();
const Order = require("./src/models/Order");
const Course = require("./src/models/course");

const INSTRUCTOR_ID = "69c02aae0058b23525dcd11d";

async function debug() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected");

  const range = "6m";
  let startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 5);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const monthlyRevenueResult = await Order.aggregate([
    {
      $match: {
        instructorId: String(INSTRUCTOR_ID),
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

  console.log("Monthly Aggregation Result:", JSON.stringify(monthlyRevenueResult, null, 2));

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

  console.log("Final Formatted Result:", JSON.stringify(monthlyRevenue, null, 2));
  process.exit();
}

debug();
