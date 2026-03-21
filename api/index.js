require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./connect");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes/index");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const instructorAnalyticsRoutes = require("./routes/instructor-routes/analytics-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const userRoutes = require("./routes/user-routes");
const studentReviewRoutes = require("./routes/student-routes/review-routes");
const studentDiscoveryRoutes = require("./routes/student-routes/discovery-routes");
const adminUserRoutes = require("./routes/admin-routes/user-routes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
  ].filter(Boolean),
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like Postman/curl) and localhost dev origins.
    if (
      !origin ||
      allowedOrigins.has(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("API is healthy :) ");
});

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/instructor", instructorAnalyticsRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/student/course/reviews", studentReviewRoutes);
app.use("/student/discovery", studentDiscoveryRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminUserRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Something went wrong" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
});
