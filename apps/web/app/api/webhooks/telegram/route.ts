import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const BOT_WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET || ''; // optional shared secret between web and bot
const BOT_INTERNAL_WEBHOOK = process.env.BOT_INTERNAL_WEBHOOK || ''; // e.g. http://bot-service:3002/telegram-webhook

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    if (!BOT_INTERNAL_WEBHOOK) {
      return NextResponse.json({ ok: false, note: 'no-internal-bot' }, { status: 500 });
    }
    // forward raw update to internal bot webhook
    const res = await fetch(BOT_INTERNAL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(BOT_WEBHOOK_SECRET ? { 'x-bot-secret': BOT_WEBHOOK_SECRET } : {}) },
      body: JSON.stringify(raw)
    });
    const text = await res.text().catch(()=>null);
    return NextResponse.json({ ok: true, forwarded: true, botResp: text });
  } catch (e:any) {
    console.error('telegram webhook forward error', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
