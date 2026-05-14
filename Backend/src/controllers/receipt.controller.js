import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import fs from "fs";

let groqPromise = null;

const processReceipt = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Receipt image is required");

  if (!process.env.GROQ_API_KEY) {
    fs.unlink(req.file.path, () => {});
    throw new ApiError(500, "GROQ_API_KEY not configured. Receipt OCR requires a Groq API key.");
  }

  if (!groqPromise) {
    const Groq = (await import("groq-sdk")).default;
    groqPromise = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  const groq = groqPromise;

  const filePath = req.file.path;
  try {
    const base64Image = fs.readFileSync(filePath, { encoding: "base64" });
    const mimeType = req.file.mimetype;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the following from this receipt image and return ONLY valid JSON (no markdown, no other text):
{
  "merchant": "store name",
  "date": "YYYY-MM-DD",
  "items": [{"name": "...", "price": 0}],
  "total": 0,
  "category": "one of: Food, Transport, Shopping, Bills, Entertainment, Healthcare, Education, Grocery, Dining, Utilities, Other"
}`
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const cleanJson = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const data = JSON.parse(cleanJson);

    fs.unlink(filePath, () => {});

    return res.status(200).json(new ApiResponse(200, data, "Receipt processed"));
  } catch (error) {
    fs.unlink(filePath, () => {});
    throw new ApiError(502, `Receipt processing failed: ${error.message}`);
  }
});

export { processReceipt };
