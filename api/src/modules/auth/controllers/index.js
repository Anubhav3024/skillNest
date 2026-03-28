const User = require("../../../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { normalizeRole, isValidRole } = require("../../../utils/role");

// const registerUser = async (req, res) => {
//   const { userName, userEmail, userPassword, role } = req.body;

//   if (!userName || !userEmail || !userPassword || !role) {
//     return res.status(400).json({
//       success: false,
//       message: "userName, userEmail, userPassword and role are required",
//       });
//     }

//   const allowedRoles = ["student", "instructor"];
//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid role. Allowed roles are: student, instructor",
//       });
//     }

//   const existingUser = await User.findOne({
//     $or: [{ userEmail: userEmail }, { userName: userName }],
//   });

//   if (existingUser) {
//     return res
//       .status(400)
//       .json({ success: false, message: "User already exists" });
//   }

//   const hashedPassword = await bcrypt.hash(userPassword, 10);

//   const newUser = new User({
//     userName,
//     userEmail,
//     userPassword: hashedPassword,
//     role,
//   });
//   await newUser.save();

//   return res
//     .status(200)
//     .json({ success: true, message: "User registered successfully", newUser });
// };
const registerUser = async (req, res) => {
  try {
    let { userName, userEmail, userPassword, role } = req.body;

    console.info("Auth register attempt", {
      action: "register",
      userName,
      userEmail,
      role,
    });

    if (!userName || !userEmail || !userPassword || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    userEmail = userEmail.toLowerCase();
    userName = userName.toLowerCase();

    role = normalizeRole(role);
    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (userPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ userEmail }, { userName }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = await User.create({
      userName,
      userEmail,
      userPassword: hashedPassword,
      role,
    });

    const userResponse = {
      _id: newUser._id,
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    // console.log("Request Body: working", req.body);

    const accessToken = jwt.sign(
      {
        _id: newUser._id,
        userName: newUser.userName,
        userEmail: newUser.userEmail,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { ...userResponse, role },
      accessToken,
    });
  } catch (error) {
    console.error("Register error details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    console.info("Auth login attempt", {
      action: "login",
      userEmail,
    });

    if (!userEmail || !userPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { userEmail: userEmail.toLowerCase() },
        { userName: userEmail.toLowerCase() },
      ],
    }).select("+userPassword");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user email or password",
      });
    }

    const isCorrectPassword = await bcrypt.compare(
      userPassword,
      user.userPassword,
    );

    if (!isCorrectPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid user email or password",
      });
    }

    const normalizedRole = normalizeRole(user.role);
    if (!normalizedRole || !isValidRole(normalizedRole)) {
      return res.status(401).json({
        success: false,
        message: "Invalid account role. Please contact support.",
      });
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: normalizedRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    user.userPassword = undefined;
    const safeUser = user.toObject();
    delete safeUser.userPassword;
    safeUser.role = normalizedRole;

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: safeUser,
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const logoutUser = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const refreshToken = (req, res) => {
  try {
    const user = req.user;

    const normalizedRole = normalizeRole(user.role);
    const newToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: normalizedRole || user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.status(200).json({
      success: true,
      accessToken: newToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken };
