const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const { normalizeRole, isValidRole } = require("../utils/role");

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = process.env;

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

const buildUniqueUserName = async (base, fallback = "user") => {
  let candidate = base || `${fallback}${Date.now()}`;
  let counter = 0;

  while (await User.findOne({ userName: candidate })) {
    counter += 1;
    candidate = `${base || fallback}${counter}`;
  }

  return candidate;
};

const pickEmailFromProfile = (profile) => {
  const emailFromList = profile?.emails?.find((entry) => entry?.value)?.value;
  const email = emailFromList || profile?._json?.email;
  return email ? String(email).toLowerCase() : "";
};

const pickAvatarFromProfile = (profile) =>
  profile?.photos?.[0]?.value || profile?._json?.avatar_url || "";

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID || "missing-client-id",
      clientSecret: GITHUB_CLIENT_SECRET || "missing-client-secret",
      callbackURL: GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback",
      scope: ["user:email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = pickEmailFromProfile(profile);
        if (!email) {
          return done(null, false, { message: "GitHub account missing email." });
        }

        let user = await User.findOne({
          $or: [{ githubId: profile.id }, { userEmail: email }],
        });

        if (user) {
          let shouldSave = false;

          if (!user.githubId) {
            user.githubId = profile.id;
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

        const requestedRole = normalizeRole(req.session?.oauthRole);
        const role = isValidRole(requestedRole) ? requestedRole : "student";

        const rawPassword = crypto.randomBytes(24).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 12);

        const base =
          sanitizeUserName(profile?.username) ||
          sanitizeUserName(profile?.displayName) ||
          sanitizeUserName(email.split("@")[0]);
        const userName = await buildUniqueUserName(base, "github");

        user = await User.create({
          userName,
          userEmail: email,
          userPassword: hashedPassword,
          role,
          githubId: profile.id,
          avatar: pickAvatarFromProfile(profile),
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
      callbackURL: GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(null, false, { message: "Google account missing email." });
        }

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { userEmail: email }],
        });

        if (user) {
          let shouldSave = false;

          if (!user.googleId) {
            user.googleId = profile.id;
            shouldSave = true;
          }

          if (profile?.photos?.[0]?.value && user.avatar !== profile.photos[0].value) {
            user.avatar = profile.photos[0].value;
            shouldSave = true;
          }

          if (shouldSave) {
            await user.save();
          }

          return done(null, user);
        }

        const requestedRole = normalizeRole(req.session?.oauthRole);
        const role = isValidRole(requestedRole) ? requestedRole : "student";

        const rawPassword = crypto.randomBytes(24).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 12);

        const base =
          sanitizeUserName(profile?.displayName) || sanitizeUserName(email.split("@")[0]);
        const userName = await buildUniqueUserName(base, "google");

        user = await User.create({
          userName,
          userEmail: email,
          userPassword: hashedPassword,
          role,
          googleId: profile.id,
          avatar: profile?.photos?.[0]?.value || "",
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

module.exports = passport;
