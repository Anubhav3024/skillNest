const files = [
  "dotenv",
  "express",
  "cors",
  "./connect",
  "./routes/auth-routes/index",
  "./routes/instructor-routes/media-routes/index",
  "./routes/instructor-routes/course-routes",
  "./routes/student-routes/course-routes",
  "./routes/student-routes/order-routes",
  "./routes/student-routes/student-courses-routes",
  "./routes/student-routes/course-progress-routes",
  "./routes/user-routes",
  "./routes/student-routes/review-routes",
  "./routes/student-routes/discovery-routes",
  "./routes/admin-routes/user-routes"
];

for (const file of files) {
  try {
    console.log(`Loading ${file}...`);
    require(file);
    console.log(`SUCCESS: ${file} loaded.`);
  } catch (err) {
    console.error(`FAILED: ${file}`);
    console.error(err);
    process.exit(1);
  }
}
console.log("All modules loaded successfully.");
