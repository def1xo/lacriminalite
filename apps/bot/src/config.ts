export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => Number(s.trim())).filter(Boolean);
export const ADMIN_PASSWORD = process.env.BOT_ADMIN_PASSWORD || ''; // второй этап защиты
export const SITE_ADMIN_API = process.env.SITE_ADMIN_API || `${process.env.SITE_URL || ''}/api/admin`;
export const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || '';
export const SITE_UPLOAD_API = process.env.SITE_UPLOAD_API || `${process.env.SITE_URL || ''}/api/upload`;
