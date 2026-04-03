const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} = require("../controllers/index");

const { authenticate, authenticateOptionally } = require("../../../middlewares/auth-middleware");
const User = require("../../../models/user");
const { normalizeRole } = require("../../../utils/role");
const { isValidRole } = require("../../../utils/role");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  issueOAuthTicket,
  consumeOAuthTicket,
} = require("../../../utils/oauth-ticket-store");

const router = require("express").Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined before starting auth routes");
}

const clientUrl = String(
  process.env.CLIENT_URL || "http://localhost:5173",
).trim();

const oauthCookieClearOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const fetchAndNormalizeUser = async (userId) => {
  const user = await User.findById(userId).select("-userPassword");
  if (!user) return null;

  const normalizedRole = normalizeRole(user.role);
  if (normalizedRole && normalizedRole !== user.role) {
    user.role = normalizedRole;
    await user.save();
  }

  return user;
};

const hasEnv = (key) => String(process.env[key] || "").trim() !== "";

const isGitHubConfigured = () =>
  Boolean(
    hasEnv("GITHUB_CLIENT_ID") &&
    hasEnv("GITHUB_CLIENT_SECRET") &&
    hasEnv("GITHUB_CALLBACK_URL"),
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
    hasEnv("GOOGLE_CLIENT_ID") &&
    hasEnv("GOOGLE_CLIENT_SECRET") &&
    hasEnv("GOOGLE_CALLBACK_URL"),
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

const OAUTH_STATE_SECRET = String(
  process.env.OAUTH_STATE_SECRET || process.env.SESSION_SECRET || JWT_SECRET,
).trim();

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const base64UrlDecode = (value) => {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64").toString("utf8");
};

const signOAuthState = (payload) => {
  const data = base64UrlEncode(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", OAUTH_STATE_SECRET)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${data}.${sig}`;
};

const verifyOAuthState = (state, maxAgeMs = 10 * 60 * 1000) => {
  const [data, sig] = String(state || "").split(".");
  if (!data || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", OAUTH_STATE_SECRET)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  try {
    const a = Buffer.from(expectedSig);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(data));
    if (!payload || typeof payload !== "object") return null;
    if (!payload.ts || Date.now() - Number(payload.ts) > maxAgeMs) return null;
    const role = normalizeRole(payload.role);
    return { role: isValidRole(role) ? role : "student" };
  } catch {
    return null;
  }
};

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, (req, res, next) => {
  // Backwards compatible: older OAuth flow set an accessToken cookie.
  // Always clear it so logout behaves consistently across auth methods.
  res.clearCookie("accessToken", oauthCookieClearOptions);
  return logoutUser(req, res, next);
});
router.post("/refresh-token", authenticate, refreshToken);
router.get("/check-auth", authenticateOptionally, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: false,
        message: "Unauthenticated guest user",
      });
    }

    const user = await fetchAndNormalizeUser(req.user?._id);
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User context not found in database",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User authenticated!!!",
      user,
    });
  } catch (error) {
    console.error("/check-auth error:", error);
    return res.status(200).json({
      success: false,
      message: "Internal error during auth check",
      details: error.message,
    });
  }
});
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await fetchAndNormalizeUser(req.user?._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("/me error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
      details: error.message,
    });
  }
});

router.get("/github", ensureGitHubConfigured, (req, res, next) => {
  const role = normalizeRole(req.query.role);
  const state = signOAuthState({
    role: isValidRole(role) ? role : "student",
    ts: Date.now(),
    nonce: crypto.randomBytes(8).toString("hex"),
  });

  return passport.authenticate("github", {
    scope: ["user:email"],
    state,
  })(req, res, next);
});

router.get("/github/callback", ensureGitHubConfigured, (req, res, next) => {
  const verified = verifyOAuthState(req.query.state);
  req.oauthRole = verified?.role || "student";

  passport.authenticate("github", { session: false }, (err, user, info) => {
    if (err) {
      console.error("GitHub OAuth error:", err);
      const reason = encodeURIComponent("GitHub login failed");
      res.redirect(`${clientUrl}/auth?oauth=github&error=1&reason=${reason}`);
      return;
    }

    (async () => {
      if (!user) {
        const reason = encodeURIComponent(info?.message || "GitHub login failed");
        res.redirect(`${clientUrl}/auth?oauth=github&error=1&reason=${reason}`);
        return;
      }

      // Issue a short-lived, one-time ticket that the SPA can exchange for a JWT.
      // This avoids putting the JWT directly into the redirect URL.
      const ticket = await issueOAuthTicket(
        { userId: String(user._id) },
        2 * 60 * 1000,
      );

      // Clear any previous cookie-based auth token to keep behavior consistent.
      res.clearCookie("accessToken", oauthCookieClearOptions);

      res.redirect(
        `${clientUrl}/auth?oauth=github&ticket=${encodeURIComponent(ticket)}`,
      );
    })().catch((callbackError) => {
      console.error("GitHub OAuth callback error:", callbackError);
      const reason = encodeURIComponent("OAuth processing failed");
      res.redirect(`${clientUrl}/auth?oauth=github&error=1&reason=${reason}`);
    });
  })(req, res, next);
});

router.get("/google", ensureGoogleConfigured, (req, res, next) => {
  const role = normalizeRole(req.query.role);
  const state = signOAuthState({
    role: isValidRole(role) ? role : "student",
    ts: Date.now(),
    nonce: crypto.randomBytes(8).toString("hex"),
  });

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    state,
  })(req, res, next);
});

router.get("/google/callback", ensureGoogleConfigured, (req, res, next) => {
  const verified = verifyOAuthState(req.query.state);
  req.oauthRole = verified?.role || "student";

  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Google OAuth error:", err);
      const reason = encodeURIComponent("Google login failed");
      res.redirect(`${clientUrl}/auth?oauth=google&error=1&reason=${reason}`);
      return;
    }

    (async () => {
      if (!user) {
        const reason = encodeURIComponent(info?.message || "Google login failed");
        res.redirect(`${clientUrl}/auth?oauth=google&error=1&reason=${reason}`);
        return;
      }

      const ticket = await issueOAuthTicket(
        { userId: String(user._id) },
        2 * 60 * 1000,
      );

      res.clearCookie("accessToken", oauthCookieClearOptions);

      res.redirect(
        `${clientUrl}/auth?oauth=google&ticket=${encodeURIComponent(ticket)}`,
      );
    })().catch((callbackError) => {
      console.error("Google OAuth callback error:", callbackError);
      const reason = encodeURIComponent("OAuth processing failed");
      res.redirect(`${clientUrl}/auth?oauth=google&error=1&reason=${reason}`);
    });
  })(req, res, next);
});

router.post("/oauth/exchange", async (req, res) => {
  try {
    const ticket = String(req.body?.ticket || "").trim();

    if (!ticket) {
      return res.status(400).json({
        success: false,
        message: "Missing OAuth ticket",
      });
    }

    const payload = await consumeOAuthTicket(ticket);
    if (!payload) {
      return res.status(410).json({
        success: false,
        message: "OAuth ticket expired or already used",
      });
    }

    if (!payload.userId) {
      return res.status(410).json({
        success: false,
        message: "OAuth ticket is invalid",
      });
    }

    const safeUser = await fetchAndNormalizeUser(payload.userId);
    if (!safeUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const accessToken = jwt.sign(
      {
        _id: safeUser._id,
        userName: safeUser.userName,
        userEmail: safeUser.userEmail,
        role: safeUser.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.status(200).json({
      success: true,
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    console.error("OAuth ticket exchange error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to exchange OAuth ticket",
    });
  }
});

module.exports = router;
