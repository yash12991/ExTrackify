import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/Users.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Debug logging for token extraction
    console.log("🔍 Headers:", req.headers.authorization);
    console.log("🔍 Cookies:", req.cookies);

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    console.log("🔍 Extracted token:", token ? "Present" : "Missing");

    if (!token) {
      console.log("❌ No token found in request");
      throw new ApiError(401, "Unauthorised request");
    }

    // Check if ACCESS_TOKEN_SECRET exists
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

    next(); // <-- This is required!
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    throw new ApiError(401, error?.message || "Invalid access token");
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
