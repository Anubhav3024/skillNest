require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/modules/auth/routes/index");
const mediaRoutes = require("./src/modules/course/routes/media-routes/index");
const instructorCourseRoutes = require("./src/modules/course/routes/course-routes");
const instructorAnalyticsRoutes = require("./src/modules/course/routes/analytics-routes");
const studentViewCourseRoutes = require("./src/modules/student/routes/course-routes");
const studentViewOrderRoutes = require("./src/modules/student/routes/order-routes");
const studentCoursesRoutes = require("./src/modules/student/routes/student-courses-routes");
const studentCourseProgressRoutes = require("./src/modules/student/routes/course-progress-routes");
const studentReviewRoutes = require("./src/modules/student/routes/review-routes");
const studentDiscoveryRoutes = require("./src/modules/student/routes/discovery-routes");
const userRoutes = require("./src/modules/user/routes/index");
const adminUserRoutes = require("./src/modules/admin/routes/user-routes");
const analyticsRoutes = require("./src/modules/analytics/routes/index");
const instructorRoutes = require("./src/modules/instructor/routes/instructor-routes");

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

// Update express.json to capture raw body for Stripe Webhook verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  }),
);

app.get("/health", (req, res) => {
  res.send("API is healthy :) ");
});

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/instructor", instructorAnalyticsRoutes); // Legacy
app.use("/api/analytics", analyticsRoutes); // New SaaS Analytics
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/student/course/reviews", studentReviewRoutes);
app.use("/student/discovery", studentDiscoveryRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminUserRoutes);
app.use("/instructor", instructorRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message || "Something went wrong" });
});

const http = require("http");
const { initSocket } = require("./src/utils/socket-service");

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
});
