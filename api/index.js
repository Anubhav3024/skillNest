require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./src/config/db");
require("./src/config/passport");
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
const studentDashboardRoutes = require("./src/modules/student/routes/student-dashboard-routes");
const studentActivityRoutes = require("./src/modules/student/routes/student-activity-routes");
const notificationRoutes = require("./src/modules/notification/routes/notification-routes");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

if (isProduction) {
  // Required for secure cookies/sessions behind reverse proxies (Render/NGINX/etc).
  app.set("trust proxy", 1);
}

let MongoStore = null;
if (isProduction) {
  try {
    MongoStore = require("connect-mongo");
  } catch (error) {
    throw new Error(
      "Missing dependency: connect-mongo. Install it in api/ (npm i connect-mongo) for production session storage.",
    );
  }
}

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

const finalSessionSecret =
  process.env.SESSION_SECRET || (isProduction ? null : "dev_session_secret");

if (isProduction && !finalSessionSecret) {
  throw new Error("SESSION_SECRET must be defined in production");
}

const sessionConfig = {
  secret: finalSessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  },
};

if (isProduction) {
  const sessionStoreUrl =
    process.env.SESSION_STORE_URL || process.env.MONGO_URL;
  if (!sessionStoreUrl) {
    throw new Error(
      "SESSION_STORE_URL or MONGO_URL must be defined in production",
    );
  }

  const ttlSeconds = Number.parseInt(process.env.SESSION_TTL_SECONDS || "", 10);
  if (!MongoStore) {
    throw new Error("connect-mongo must be installed for production sessions");
  }
  sessionConfig.store = MongoStore.create({
    mongoUrl: sessionStoreUrl,
    ttl:
      Number.isFinite(ttlSeconds) && ttlSeconds > 0
        ? ttlSeconds
        : 60 * 60 * 24 * 7,
    autoRemove: "native",
  });
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number.parseInt(process.env.RATE_LIMIT_GLOBAL || "", 10) || 1200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number.parseInt(process.env.RATE_LIMIT_AUTH || "", 10) || 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts, please try again later.",
  },
});

app.use(globalRateLimiter);

// Capture raw body for webhook signature verification
app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  }),
);

app.use(mongoSanitize({ replaceWith: "_" }));

app.get("/health", (req, res) => {
  res.send("API is healthy :) ");
});

app.use("/auth", authRateLimiter);
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
app.use("/student/dashboard", studentDashboardRoutes);
app.use("/student/activity", studentActivityRoutes);
app.use("/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  res
    .status(500)
    .json({ success: false, message: err.message || "Something went wrong" });
});

const http = require("http");
const { initSocket } = require("./src/utils/socket-service");

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  server
    .listen(PORT, () => {
      console.log(`
-----------------------------------------
🚀 SERVER INITIALIZED
📍 PORT: ${PORT}
📦 DATABASE: MongoDB Connected
🔋 STATUS: Online
-----------------------------------------
    `);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`
❌ CRITICAL ERROR: PORT ${PORT} IS ALREADY IN USE
-----------------------------------------------
The backend cannot start because port ${PORT} is being held by another process.
This often happens when a previous instance didn't shut down correctly.

RECOMMENDED ACTION: Run 'npx kill-port ${PORT}' or restart the terminal.
-----------------------------------------------
      `);
        process.exit(1);
      } else {
        console.error("SERVER ERROR:", err);
      }
    });
});
