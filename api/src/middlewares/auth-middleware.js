const jwt = require("jsonwebtoken");
const { normalizeRole } = require("../utils/role");

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const separator = pair.indexOf("=");
      if (separator < 0) return acc;
      const key = decodeURIComponent(pair.slice(0, separator).trim());
      const value = decodeURIComponent(pair.slice(separator + 1).trim());
      acc[key] = value;
      return acc;
    }, {});

const authenticate = async (req, res, next) => {
  let token;

  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else {
      const cookies = parseCookies(req.headers.cookie || "");
      token = cookies.accessToken;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided for authorization" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...payload,
      role: normalizeRole(payload?.role),
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please log in again",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    const normalizedRole = normalizeRole(req.user?.role);
    if (!req.user || !roles.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
    }
    next();
  };
};

module.exports = { authenticate, checkRole };
