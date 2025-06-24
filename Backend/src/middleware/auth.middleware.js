import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/Users.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "").trim();


    if (!token) {
      // return res.status(401).json({message:"Unauthorised request"});
      throw new ApiError(401, "Unauthorised request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "User not found");
    }
    req.user = user;

    next(); // <-- This is required!
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const checksession = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "").trim();

    if (token) {
      throw new ApiError(401, "User already logged in");
    }
    next();
  } catch (error) {
    next(error); // Pass the actual error for proper handling
  }
});
