require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./modals/course");

async function checkCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);
    if (courses.length > 0) {
      console.log("First course sample:", JSON.stringify(courses[0], null, 2));
    }
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error checking courses:", error);
  }
}

checkCourses();
