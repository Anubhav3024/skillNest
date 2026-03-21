const router = require("express").Router();
const { authenticate } = require("../../middleware/auth-middleware");

const {
  createOrder,
  capturePaymentAndFinalizeOrder,
  getOrderHistory,
  handleWebhook,
} = require("../../controllers/student-controllers/order-controller");

router.post("/create", authenticate, createOrder);
router.post("/capture", authenticate, capturePaymentAndFinalizeOrder);
router.get("/history/:userId", authenticate, getOrderHistory);
router.post("/webhook", handleWebhook);

module.exports = router;
