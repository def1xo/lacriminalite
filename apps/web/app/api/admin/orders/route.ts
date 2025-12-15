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

  if (action === 'list') {
    const list = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
    return NextResponse.json({ ok: true, orders: list });
  }

  if (action === 'get') {
    if (!payload?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const o = await prisma.order.findUnique({ where: { id: Number(payload.id) }, include: { items: true } });
    return NextResponse.json({ ok: true, order: o });
  }

  if (action === 'updateStatus') {
    if (!payload?.id || !payload?.status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    const o = await prisma.order.update({
      where: { id: Number(payload.id) },
      data: { status: String(payload.status) }
    });
    return NextResponse.json({ ok: true, order: o });
  }

  if (action === 'setTracking') {
    if (!payload?.id || !payload?.tracking || !payload?.carrier) return NextResponse.json({ error: 'id, tracking and carrier required' }, { status: 400 });
    const data: any = {};
    if (payload.carrier === 'sdek') data.sdekTracking = String(payload.tracking);
    if (payload.carrier === 'yandex') data.yandexClaimId = String(payload.tracking);
    const o = await prisma.order.update({ where: { id: Number(payload.id) }, data });
    return NextResponse.json({ ok: true, order: o });
  }

  if (action === 'delete') {
    if (!payload?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await prisma.order.delete({ where: { id: Number(payload.id) } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
