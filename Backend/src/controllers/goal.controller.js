import { Goal } from "../models/Goal.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Helper function to calculate goal completion
const calculateGoalCompletion = (
  targetAmount,
  currentSaved = 0,
  dailySavingRate,
  frequency = "daily"
) => {
  const remainingAmount = targetAmount - currentSaved;
  if (remainingAmount <= 0) {
    return { daysNeeded: 0, estimatedCompletionDate: new Date() };
  }

  const dailyRate =
    frequency === "weekly" ? dailySavingRate / 7 : dailySavingRate;
  const daysNeeded = Math.ceil(remainingAmount / dailyRate);

  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(
    estimatedCompletionDate.getDate() + daysNeeded
  );

  return { daysNeeded, estimatedCompletionDate };
};

// Estimate goal completion
export const estimateGoalCompletion = asyncHandler(async (req, res) => {
  const {
    targetAmount,
    currentSaved = 0,
    dailySavingRate,
    frequency = "daily",
  } = req.body;

  // Validation
  if (!targetAmount || !dailySavingRate) {
    throw new ApiError(400, "Target amount and daily saving rate are required");
  }

  if (targetAmount <= 0 || dailySavingRate <= 0) {
    throw new ApiError(400, "Target amount and saving rate must be positive");
  }

  if (currentSaved < 0) {
    throw new ApiError(400, "Current saved amount cannot be negative");
  }

  if (!["daily", "weekly"].includes(frequency)) {
    throw new ApiError(400, "Frequency must be either 'daily' or 'weekly'");
  }

  const result = calculateGoalCompletion(
    targetAmount,
    currentSaved,
    dailySavingRate,
    frequency
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, "Goal estimation calculated"));
});

// Create a new goal
export const createGoal = asyncHandler(async (req, res) => {
  const {
    title,
    targetAmount,
    currentSaved = 0,
    dailySavingRate,
    frequency = "daily",
  } = req.body;

  // Validation
  if (!title || !targetAmount || !dailySavingRate) {
    throw new ApiError(
      400,
      "Title, target amount, and daily saving rate are required"
    );
  }

  if (title.trim().length < 2) {
    throw new ApiError(400, "Title must be at least 2 characters long");
  }

  if (targetAmount <= 0 || dailySavingRate <= 0) {
    throw new ApiError(400, "Target amount and saving rate must be positive");
  }

  if (currentSaved < 0) {
    throw new ApiError(400, "Current saved amount cannot be negative");
  }

  if (currentSaved >= targetAmount) {
    throw new ApiError(
      400,
      "Current saved amount cannot be greater than or equal to target amount"
    );
  }

  const { estimatedCompletionDate } = calculateGoalCompletion(
    targetAmount,
    currentSaved,
    dailySavingRate,
    frequency
  );

  const goal = await Goal.create({
    user: req.user._id,
    title: title.trim(),
    targetAmount,
    currentSaved,
    dailySavingRate,
    frequency,
    estimatedCompletionDate,
  });

  res.status(201).json(new ApiResponse(201, goal, "Goal created successfully"));
});

// Get all goals for user
export const getGoals = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };

  if (status && ["in-progress", "completed"].includes(status)) {
    filter.status = status;
  }

  const goals = await Goal.find(filter).sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, goals, "Goals fetched successfully"));
});

// Get single goal by ID
export const getGoalById = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  res.status(200).json(new ApiResponse(200, goal, "Goal fetched successfully"));
});

// Update goal
export const updateGoal = asyncHandler(async (req, res) => {
  const { targetAmount, currentSaved, dailySavingRate, frequency, status } =
    req.body;

  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  // Update fields if provided
  if (req.body.title) goal.title = req.body.title;
  if (targetAmount !== undefined) goal.targetAmount = targetAmount;
  if (currentSaved !== undefined) goal.currentSaved = currentSaved;
  if (dailySavingRate !== undefined) goal.dailySavingRate = dailySavingRate;
  if (frequency) goal.frequency = frequency;
  if (status) goal.status = status;

  // Automatic status management based on currentSaved vs targetAmount
  if (currentSaved !== undefined || targetAmount !== undefined) {
    const finalCurrentSaved = currentSaved !== undefined ? currentSaved : goal.currentSaved;
    const finalTargetAmount = targetAmount !== undefined ? targetAmount : goal.targetAmount;
    
    // If currentSaved >= targetAmount, mark as completed
    if (finalCurrentSaved >= finalTargetAmount) {
      goal.status = "completed";
    } 
    // If currentSaved < targetAmount and current status is completed, change to in-progress
    else if (finalCurrentSaved < finalTargetAmount && goal.status === "completed") {
      goal.status = "in-progress";
    }
    // If it's a new goal or status is not set, default to in-progress
    else if (!goal.status || goal.status === "") {
      goal.status = "in-progress";
    }
  }

  // Recalculate completion date if relevant fields changed
  if (
    targetAmount !== undefined ||
    currentSaved !== undefined ||
    dailySavingRate !== undefined ||
    frequency
  ) {
    const { estimatedCompletionDate } = calculateGoalCompletion(
      goal.targetAmount,
      goal.currentSaved,
      goal.dailySavingRate,
      goal.frequency
    );
    goal.estimatedCompletionDate = estimatedCompletionDate;
  }

  await goal.save();

  res.status(200).json(new ApiResponse(200, goal, "Goal updated successfully"));
});

// Delete goal
export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "Goal deleted successfully"));
});

// Mark goal as completed
export const markGoalComplete = asyncHandler(async (req, res) => {
  const goalId = req.params.id;
  const userId = req.user._id;

  console.log(`Attempting to complete goal: ${goalId} for user: ${userId}`);

  const goal = await Goal.findOneAndUpdate(
    { _id: goalId, user: userId },
    { status: "completed" },
    { new: true }
  );

  if (!goal) {
    console.log(`Goal not found: ${goalId} for user: ${userId}`);
    throw new ApiError(404, "Goal not found");
  }

  console.log(`Goal completed successfully: ${goalId}`);
  res.status(200).json(new ApiResponse(200, goal, "Goal marked as completed"));
});

// Get goal analytics
export const getGoalAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const analytics = await Goal.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalGoals: { $sum: 1 },
        completedGoals: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        totalTargetAmount: { $sum: "$targetAmount" },
        totalSavedAmount: { $sum: "$currentSaved" },
      },
    },
  ]);

  const result =
    analytics.length > 0
      ? analytics[0]
      : {
          totalGoals: 0,
          completedGoals: 0,
          totalTargetAmount: 0,
          totalSavedAmount: 0,
        };

  res.status(200).json(new ApiResponse(200, result, "Goal analytics fetched"));
});
