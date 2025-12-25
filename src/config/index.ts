import "dotenv/config";

export const ADMIN_ID = Number(process.env.ADMIN_ID);
export const BOT_TOKEN = process.env.BOT_TOKEN!;
export const MONGO_URI = process.env.MONGO_URI!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const PRESENTATION_COST = Number(process.env.PRESENTATION_COST) || 100;
export const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
export const REQUIRED_CHANNEL_ID = process.env.REQUIRED_CHANNEL_ID || "";
export const REQUIRED_CHANNEL_USERNAME = process.env.REQUIRED_CHANNEL_USERNAME || "";

// Channel for daily posts
export const CHANNEL_ID = process.env.CHANNEL_ID || "";
