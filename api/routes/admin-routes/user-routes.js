const router = require("express").Router();
const {
  getAllUsers,
  deleteUser,
} = require("../../controllers/admin-controllers/user-controller");
const { authenticate, checkRole } = require("../../middleware/auth-middleware");

// In a real app, you'd add a "checkAdmin" middleware here.
// For now, we'll just use authenticate.
router.get("/users/all", authenticate, checkRole("admin"), getAllUsers);
router.delete(
  "/users/delete/:id",
  authenticate,
  checkRole("admin"),
  deleteUser,
);

module.exports = router;
