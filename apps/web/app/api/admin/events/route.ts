import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || '';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || '';
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { action, payload } = body;
  if (!action) return NextResponse.json({ error: 'action required' }, { status: 400 });

  if (action === 'addEvent') {
    const e = await prisma.event.create({
      data: {
        title: payload.title || 'Untitled',
        slug: payload.slug || null,
        description: payload.description || null,
        price: payload.price ?? null,
        images: payload.images || [],
        startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
        endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
        meta: payload.meta || {}
      }
    });
    return NextResponse.json({ ok: true, event: e });
  }

  if (action === 'editEvent') {
    if (!payload?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const e = await prisma.event.update({
      where: { id: Number(payload.id) },
      data: {
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        price: payload.price ?? null,
        images: payload.images ?? [],
        startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
        endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
        meta: payload.meta ?? {}
      }
    });
    return NextResponse.json({ ok: true, event: e });
  }

  if (action === 'deleteEvent') {
    if (!payload?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await prisma.event.delete({ where: { id: Number(payload.id) } });
    return NextResponse.json({ ok: true });
  }

  if (action === 'listEvents') {
    const list = await prisma.event.findMany({ orderBy: { startsAt: 'desc' } });
    return NextResponse.json({ ok: true, events: list });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
