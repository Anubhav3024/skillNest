const express = require("express");
const { authenticate } = require("../../../middlewares/auth-middleware");
const {
  getActivityOverview,
} = require("../controllers/student-activity-controller");
const router = express.Router();

router.get("/activity-overview/:userId", authenticate, getActivityOverview);

module.exports = router;
