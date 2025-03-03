import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID