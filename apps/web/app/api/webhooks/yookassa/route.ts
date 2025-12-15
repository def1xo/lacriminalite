import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fetch from 'node-fetch';
import crypto from 'crypto';

function headerCandidates(headers: Headers) {
  const keys = [
    'x-hmac-signature',
    'x-signature',
    'x-hook-signature',
    'x-hub-signature',
    'x-request-signature',
    'x-signature-sha256',
    'signature'
  ];
  for (const k of keys) {
    const v = headers.get(k);
    if (v) return { name: k, value: v };
  }
  return null;
}

function verifyHmac(raw: Buffer, headerValue: string, secret: string) {
  const h = crypto.createHmac('sha256', secret).update(raw).digest();
  const hex = h.toString('hex');
  const b64 = h.toString('base64');
  const normalized = headerValue.replace(/^(signature=)?/, '').trim();
  if (normalized === hex) return true;
  if (normalized === b64) return true;
  if (normalized === `sha256=${hex}`) return true;
  if (normalized === `sha256=${b64}`) return true;
  return false;
}

async function notifyAdmins(text: string) {
  const BOT_TOKEN = process.env.BOT_TOKEN || '';
  const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!BOT_TOKEN) return;
  for (const id of ADMIN_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: Number(id), text, parse_mode: 'Markdown' }),
      });
    } catch (e) {
      console.error('notifyAdmins fail', e);
    }
  }
}

export async function POST(req: Request) {
  try {
    const raw = Buffer.from(await req.arrayBuffer());
    const headers = (req as any).headers || new Headers();
    const candidate = headerCandidates(headers);
    const secret = process.env.YOOKASSA_WEBHOOK_SECRET || '';
    if (candidate && secret) {
      const ok = verifyHmac(raw, candidate.value, secret);
      if (!ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }
    const body = JSON.parse(raw.toString('utf8'));
    const event = body.event;
    if (!event) return NextResponse.json({ ok: true });
    if (event === 'payment.succeeded' || event === 'payment.waiting_for_capture') {
      const payment = body.object;
      const orderNumber = payment.metadata?.orderNumber || (typeof payment.description === 'string' ? payment.description : undefined);
      if (orderNumber) {
        await prisma.order.updateMany({
          where: { orderNumber: String(orderNumber) },
          data: {
            status: 'paid',
            paymentId: `YooKassa: ${payment.id}`
          }
        });
        const text = `Оплата принята. Order ${orderNumber}\nPayment ID: YooKassa: ${payment.id}`;
        await notifyAdmins(text);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('yookassa webhook error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
