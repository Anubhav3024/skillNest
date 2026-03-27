const router = require("express").Router();
const { authenticate } = require("../../../middlewares/auth-middleware");

const {
  createOrder,
  capturePaymentAndFinalizeOrder,
  getOrderHistory,
  getStudentTransactions,
  handleWebhook,
} = require("../controllers/order-controller");

router.post("/create", authenticate, createOrder);
router.post("/capture", authenticate, capturePaymentAndFinalizeOrder);
router.get("/history/:userId", authenticate, getOrderHistory);
router.get("/transactions/:userId", authenticate, getStudentTransactions);
router.post("/webhook", handleWebhook);

module.exports = router;
