import "dotenv/config";

export const ADMIN_ID = Number(process.env.ADMIN_ID);
export const BOT_TOKEN = process.env.BOT_TOKEN!;
export const MONGO_URI = process.env.MONGO_URI!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const PRESENTATION_COST = Number(process.env.PRESENTATION_COST) || 1000; // Default cost in "ball"
