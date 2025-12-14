// apps/bot/src/config.ts
export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean).map(Number);
export const BOT_SECONDARY_PASSWORD = process.env.BOT_SECONDARY_PASSWORD || '';
export const SITE_ADMIN_API = process.env.SITE_URL ? `${process.env.SITE_URL.replace(/\/$/, '')}/api/admin` : 'http://localhost:3000/api/admin';
export const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || '';
export const TELEGRAM_ADMIN_CHAT_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean).map(Number);
