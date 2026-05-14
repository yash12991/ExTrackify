import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/Users.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/resend.js";
import { welcomeTemplate, forgotPasswordTemplate } from "../utils/emailTemplates.js";

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(501, "user not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!req.body) {
    throw new ApiError(400, "Request body is missing");
  }
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new ApiError(401, "Invalid email");
  }
  if (password.length < 6) {
    throw new ApiError(401, "Password size should be greater than 6");
  }

  const existedUser = await User.findOne({
    $or: [{ username: email }, { email }],
  });
  if (existedUser) {
    throw new ApiError(400, "User with email already exists");
  }

  const user = await User.create({
    fullname: name,
    username: email, // Using email as username for simplicity
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while creation");
  }

  // Generate tokens for immediate login after registration
  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };

  sendEmail({
    to: email,
    subject: "Welcome to ExTrackify! 🎉",
    html: welcomeTemplate(name),
  }).catch((err) => console.error("Welcome email failed:", err));

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        "user created successfully"
      )
    );
});

// Helper function to get mobile-friendly cookie options
const getCookieOptions = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // None for production, Lax for development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

const login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email)) {
    return res.status(400).json({ message: "Username or email is required" });
  }

  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });

  if (!user) {
    return res
      .status(404)
      .json({ message: "User with given username or email does not exist" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Use mobile-friendly cookie options
  const options = getCookieOptions(req);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const options = getCookieOptions(req);
  options.maxAge = 0; // Immediate expiration

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const IncomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!IncomingRefreshToken) {
    throw new ApiError(404, "Refresh token not found");
  }
  try {
    const decoded = jwt.verify(
      IncomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decoded) {
      throw new ApiError(401, "Unauthorized access");
    }
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== IncomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }
    const accessToken = user.generateAccessToken();

    const options = getCookieOptions(req);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullname, username } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "user not found");
  if (fullname) user.fullname = fullname;
  if (username) user.username = username;
  await user.save();
  return res.status(200).json(new ApiResponse(200, user, "Profile updated"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(401, "Old password is incorrect");

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const displayCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res
    .status(200)
    .json(new ApiResponse(201, req.user, "Current user fetch succesfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json(
      new ApiResponse(200, {}, "If an account exists, a reset link has been sent")
    );
  }

  const resetToken = jwt.sign(
    { _id: user._id, purpose: "password-reset" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  const frontendUrl = process.env.FRONTEND_URL || "https://ex-trackify.vercel.app";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  sendEmail({
    to: email,
    subject: "Reset your password - ExTrackify",
    html: forgotPasswordTemplate(resetLink),
  }).catch((err) => console.error("Password reset email failed:", err));

  return res.status(200).json(
    new ApiResponse(200, {}, "If an account exists, a reset link has been sent")
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.purpose !== "password-reset") {
      throw new ApiError(401, "Invalid reset token");
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, {}, "Password reset successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired reset token");
  }
});

export {
  registerUser,
  login,
  logout,
  refreshAccessToken,
  updateProfile,
  deleteUser,
  changePassword,
  displayCurrentUser,
  forgotPassword,
  resetPassword,
};
