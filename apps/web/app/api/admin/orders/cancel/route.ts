import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || '';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || '';
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { orderNumber, orderId } = body;
  if (!orderNumber && !orderId) {
    return NextResponse.json({ error: 'orderNumber or orderId required' }, { status: 400 });
  }

  const order = orderNumber
    ? await prisma.order.findFirst({ where: { orderNumber }, include: { items: true } })
    : await prisma.order.findUnique({ where: { id: Number(orderId) }, include: { items: true } });

  if (!order) {
    return NextResponse.json({ error: 'order not found' }, { status: 404 });
  }

  if (order.status === 'canceled' || order.status === 'cancelled') {
    return NextResponse.json({ ok: true, note: 'already canceled' });
  }

  const tx: any[] = [];

  for (const it of order.items) {
    const product = await prisma.product.findUnique({ where: { id: Number(it.productId) } });
    if (!product) continue;
    const sizeStock = product.sizeStock || {};
    const newStock = { ...(sizeStock as any) };
    const sizeKey = it.size || 'UNSPEC';
    newStock[sizeKey] = (Number(newStock[sizeKey] || 0) + Number(it.quantity || 0));
    tx.push(prisma.product.update({ where: { id: product.id }, data: { sizeStock: newStock } }));
  }

  tx.push(prisma.order.update({ where: { id: order.id }, data: { status: 'canceled' } }));
  await prisma.$transaction(tx);

  return NextResponse.json({ ok: true });
}
