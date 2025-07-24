import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/Users.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    console.log("🔍 Headers:", req.headers.authorization);
    console.log("🔍 Cookies:", req.cookies);
    console.log("🔍 User Agent:", req.headers["user-agent"]);

    // Try multiple token extraction methods for mobile compatibility
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim() ||
      req.headers["x-auth-token"] || // Alternative header for mobile
      req.body.token; // Fallback from request body

    console.log("🔍 Extracted token:", token ? "Present" : "Missing");

    if (!token) {
      console.log("❌ No token found in request");
      throw new ApiError(401, "Unauthorized request");
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.error("❌ ACCESS_TOKEN_SECRET not found in environment");
      throw new ApiError(500, "Server configuration error");
    }

    console.log("🔍 Verifying token with secret...");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("✅ Token decoded successfully:", decodedToken._id);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.log("❌ User not found for token");
      throw new ApiError(401, "User not found");
    }

    console.log("✅ User verified:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    throw new ApiError(401, error?.message || "Invalid token");
  }
});

export const checksession = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (token) {
      throw new ApiError(401, "User already logged in");
    }
    next();
  } catch (error) {
    next(error); // Pass the actual error for proper handling
  }
});
