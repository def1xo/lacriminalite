// apps/web/app/api/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // убедитесь, что prisma экспортируется как { prisma } или поправьте путь
import fetch from 'node-fetch';

const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_IDS = process.env.TELEGRAM_ADMIN_CHAT_IDS || process.env.TELEGRAM_ADMIN_CHAT_ID || '';

function sendTelegramMessageSync(chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-admin-secret') || '';
    if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'action required' }, { status: 400 });
    }

    if (action === 'addProduct') {
      const p = await prisma.product.create({
        data: {
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          price: payload.price,
          collection: payload.collection,
          images: payload.images ?? [],
          totalMade: payload.totalMade ?? 0,
          sizeStock: payload.sizeStock ?? {},
        },
      });
      return NextResponse.json({ ok: true, product: p });
    }

    if (action === 'editProduct') {
      const p = await prisma.product.update({
        where: { id: Number(payload.id) },
        data: {
          title: payload.title,
          description: payload.description,
          price: payload.price,
          images: payload.images,
          totalMade: payload.totalMade,
          sizeStock: payload.sizeStock,
          collection: payload.collection,
        },
      });
      return NextResponse.json({ ok: true, product: p });
    }

    if (action === 'addEvent') {
      const e = await prisma.event.create({
        data: {
          title: payload.title,
          description: payload.description,
          startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
          endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
          images: payload.images ?? [],
          meta: payload.meta ?? {},
        },
      });
      return NextResponse.json({ ok: true, event: e });
    }

    // другие административные действия...
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('admin api error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
