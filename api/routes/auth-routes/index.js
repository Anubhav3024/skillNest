const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} = require("../../controllers/auth-controllers/index");

const { authenticate } = require("../../middleware/auth-middleware");

const router = require("express").Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/refresh-token", authenticate, refreshToken);
router.get("/check-auth", authenticate, (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json({ success: true, message: "User authenticated!!!", user });
});
router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
});

module.exports = router;
