const express = require("express");
const { getActivityOverview } = require("../controllers/student-activity-controller");
const router = express.Router();

router.get("/activity-overview/:userId", getActivityOverview);

module.exports = router;
