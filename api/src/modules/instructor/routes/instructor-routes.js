const express = require("express");
const { broadcastMessage } = require("../controllers/instructor.controller");
const { authenticate, checkRole } = require("../../../middlewares/auth-middleware");

const router = express.Router();

router.post("/broadcast", authenticate, checkRole("instructor"), broadcastMessage);

module.exports = router;
