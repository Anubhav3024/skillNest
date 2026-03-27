const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} = require("../controllers/index");

const { authenticate } = require("../../../middlewares/auth-middleware");
const User = require("../../../models/user");
const { normalizeRole } = require("../../../utils/role");
const { isValidRole } = require("../../../utils/role");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = require("express").Router();

const isGitHubConfigured = () =>
  Boolean(
    process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_CALLBACK_URL,
  );

const ensureGitHubConfigured = (req, res, next) => {
  if (!isGitHubConfigured()) {
    return res.status(503).json({
      success: false,
      message: "GitHub OAuth is not configured",
    });
  }
  return next();
};

const isGoogleConfigured = () =>
  Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALLBACK_URL,
  );

const ensureGoogleConfigured = (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json({
      success: false,
      message: "Google OAuth is not configured",
    });
  }
  return next();
};

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/refresh-token", authenticate, refreshToken);
router.get("/check-auth", authenticate, async (req, res) => {
  const user = await User.findById(req.user?._id).select("-userPassword");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const normalizedRole = normalizeRole(user.role);
  if (normalizedRole && normalizedRole !== user.role) {
    user.role = normalizedRole;
    await user.save();
  }

  return res.status(200).json({
    success: true,
    message: "User authenticated!!!",
    user,
  });
});
router.get("/me", authenticate, async (req, res) => {
  const user = await User.findById(req.user?._id).select("-userPassword");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const normalizedRole = normalizeRole(user.role);
  if (normalizedRole && normalizedRole !== user.role) {
    user.role = normalizedRole;
    await user.save();
  }

  return res.status(200).json({ success: true, user });
});

router.get("/github", ensureGitHubConfigured, (req, res, next) => {
  const role = normalizeRole(req.query.role);
  req.session.oauthRole = isValidRole(role) ? role : "student";
  return req.session.save(() =>
    passport.authenticate("github", {
      scope: ["user:email"],
    })(req, res, next),
  );
});

router.get(
  "/github/callback",
  ensureGitHubConfigured,
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?oauth=github&error=1`,
  }),
  (req, res) => {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?oauth=github&error=1`,
      );
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?oauth=github&token=${accessToken}`,
    );
  },
);

router.get("/google", ensureGoogleConfigured, (req, res, next) => {
  const role = normalizeRole(req.query.role);
  req.session.oauthRole = isValidRole(role) ? role : "student";
  return req.session.save(() =>
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    })(req, res, next),
  );
});

router.get(
  "/google/callback",
  ensureGoogleConfigured,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?oauth=google&error=1`,
  }),
  (req, res) => {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?oauth=google&error=1`,
      );
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?oauth=google&token=${accessToken}`,
    );
  },
);

module.exports = router;
