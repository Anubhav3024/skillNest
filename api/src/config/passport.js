const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const { normalizeRole, isValidRole } = require("../utils/role");

const env = (key) => String(process.env[key] || "").trim();

const GITHUB_CLIENT_ID = env("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = env("GITHUB_CLIENT_SECRET");
const GITHUB_CALLBACK_URL = env("GITHUB_CALLBACK_URL");
const GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = env("GOOGLE_CLIENT_SECRET");
const GOOGLE_CALLBACK_URL = env("GOOGLE_CALLBACK_URL");

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
  console.warn(
    "WARNING: GitHub OAuth is not configured. Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL in api/.env.",
  );
}

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  console.warn(
    "WARNING: Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL in api/.env.",
  );
}

const sanitizeUserName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const randomSuffix = () => crypto.randomBytes(3).toString("hex");

const buildUniqueUserName = async (
  base,
  fallback = "user",
  maxAttempts = 8,
) => {
  const normalizedBase =
    sanitizeUserName(base) || `${fallback}${Date.now().toString(36)}`;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate =
      attempt === 0 ? normalizedBase : `${normalizedBase}-${randomSuffix()}`;

    try {
      const existing = await User.findOne({ userName: candidate })
        .select("_id")
        .lean();
      if (!existing) {
        return candidate;
      }
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error("Unable to generate a unique username");
};

const createOAuthUserWithRetries = async ({
  userNameBase,
  fallback,
  payload,
  maxAttempts = 5,
}) => {
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const userName = await buildUniqueUserName(userNameBase, fallback);

    try {
      return await User.create({
        ...payload,
        userName,
      });
    } catch (error) {
      lastError = error;
      if (error?.code === 11000 && error?.keyPattern?.userName) {
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error("Unable to create OAuth user");
};

const pickEmailFromProfile = (profile) => {
  const emailFromList = profile?.emails?.find((entry) => entry?.value)?.value;
  const email = emailFromList || profile?._json?.email;
  return email ? String(email).trim().toLowerCase() : "";
};

const pickAvatarFromProfile = (profile) =>
  profile?.photos?.[0]?.value || profile?._json?.avatar_url || "";

const getRequestedRole = (req) => {
  const requested = normalizeRole(req?.oauthRole ?? req.session?.oauthRole);
  return isValidRole(requested) ? requested : null;
};

const maybeUpgradeToInstructor = (userDoc, requestedRole) => {
  if (!userDoc || requestedRole !== "instructor") return false;
  const currentRole = normalizeRole(userDoc.role);
  if (currentRole === "instructor") return false;
  userDoc.role = "instructor";
  return true;
};

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID || "missing-client-id",
      clientSecret: GITHUB_CLIENT_SECRET || "missing-client-secret",
      callbackURL:
        GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback",
      scope: ["user:email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = pickEmailFromProfile(profile);
        if (!email) {
          return done(null, false, {
            message: "GitHub account missing email.",
          });
        }

        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          let shouldSave = false;

          if (maybeUpgradeToInstructor(user, getRequestedRole(req))) {
            shouldSave = true;
          }

          const avatarUrl = pickAvatarFromProfile(profile);
          if (avatarUrl && user.avatar !== avatarUrl) {
            user.avatar = avatarUrl;
            shouldSave = true;
          }

          if (shouldSave) {
            await user.save();
          }

          return done(null, user);
        }

        // If a user already exists with this email, link GitHub to that account.
        // This mirrors the Google OAuth behavior and prevents confusing failures
        // for users who signed up with email/password first.
        const existingByEmail = await User.findOne({ userEmail: email });
        if (existingByEmail) {
          if (
            existingByEmail.githubId &&
            String(existingByEmail.githubId) !== String(profile.id)
          ) {
            return done(null, false, {
              message:
                "This email is already linked to a different GitHub account.",
            });
          }

          let shouldSave = false;
          if (!existingByEmail.githubId) {
            existingByEmail.githubId = profile.id;
            shouldSave = true;
          }

          if (maybeUpgradeToInstructor(existingByEmail, getRequestedRole(req))) {
            shouldSave = true;
          }

          const avatarUrl = pickAvatarFromProfile(profile);
          if (avatarUrl && existingByEmail.avatar !== avatarUrl) {
            existingByEmail.avatar = avatarUrl;
            shouldSave = true;
          }

          if (shouldSave) {
            await existingByEmail.save();
          }

          return done(null, existingByEmail);
        }

        const role = getRequestedRole(req) || "student";

        const rawPassword = crypto.randomBytes(24).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 12);

        const base =
          sanitizeUserName(profile?.username) ||
          sanitizeUserName(profile?.displayName) ||
          sanitizeUserName(email.split("@")[0]);

        user = await createOAuthUserWithRetries({
          userNameBase: base,
          fallback: "github",
          payload: {
            userEmail: email,
            userPassword: hashedPassword,
            role,
            githubId: profile.id,
            avatar: pickAvatarFromProfile(profile),
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || "missing-client-id",
      clientSecret: GOOGLE_CLIENT_SECRET || "missing-client-secret",
      callbackURL:
        GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = String(profile?.emails?.[0]?.value || "")
          .trim()
          .toLowerCase();
        if (!email) {
          return done(null, false, {
            message: "Google account missing email.",
          });
        }

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { userEmail: email }],
        });

        if (user) {
          let shouldSave = false;

          if (maybeUpgradeToInstructor(user, getRequestedRole(req))) {
            shouldSave = true;
          }

          if (!user.googleId) {
            user.googleId = profile.id;
            shouldSave = true;
          }

          if (
            profile?.photos?.[0]?.value &&
            user.avatar !== profile.photos[0].value
          ) {
            user.avatar = profile.photos[0].value;
            shouldSave = true;
          }

          if (shouldSave) {
            await user.save();
          }

          return done(null, user);
        }

        const role = getRequestedRole(req) || "student";

        const rawPassword = crypto.randomBytes(24).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 12);

        const base =
          sanitizeUserName(profile?.displayName) ||
          sanitizeUserName(email.split("@")[0]);

        user = await createOAuthUserWithRetries({
          userNameBase: base,
          fallback: "google",
          payload: {
            userEmail: email,
            userPassword: hashedPassword,
            role,
            googleId: profile.id,
            avatar: profile?.photos?.[0]?.value || "",
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

module.exports = passport;
