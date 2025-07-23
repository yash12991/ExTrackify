import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/Users.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Enhanced debug logging for cross-origin requests
    console.log("🔍 Origin:", req.get('Origin'));
    console.log("🔍 Full Headers:", JSON.stringify(req.headers, null, 2));
    console.log("🔍 Authorization Header:", req.headers.authorization);
    console.log("🔍 Cookies:", JSON.stringify(req.cookies, null, 2));

    // Try multiple token extraction methods
    let token = null;

    // Method 1: From Authorization header
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '').trim();
        console.log("🔍 Token from Authorization header:", token ? "Present" : "Missing");
      }
    }

    // Method 2: From cookies (fallback)
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
      console.log("🔍 Token from cookies:", token ? "Present" : "Missing");
    }

    // Method 3: From custom header (fallback)
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
      console.log("🔍 Token from x-auth-token header:", token ? "Present" : "Missing");
    }

    console.log("🔍 Final extracted token:", token ? "Present (Length: " + token.length + ")" : "Missing");

    if (!token) {
      console.log("❌ No token found in any location");
      console.log("🔍 Available headers:", Object.keys(req.headers));
      console.log("🔍 Available cookies:", Object.keys(req.cookies || {}));
      throw new ApiError(401, "Unauthorised request - No token provided");
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
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid access token");
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Access token expired");
    } else {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
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
