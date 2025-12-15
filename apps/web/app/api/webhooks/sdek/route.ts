import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyAdminsText } from '@/lib/utils/notify';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderNumber = body?.external_id || body?.order?.external_id || body?.order?.number || body?.orderNumber || null;
    const cdekNumber = body?.cdek_number || body?.order?.cdek_number || body?.tracking_number || null;
    const status = body?.status || body?.order?.status || null;

    if (!orderNumber) return NextResponse.json({ ok: true });

    const updated: any = {};
    if (cdekNumber) updated.sdekTracking = String(cdekNumber);
    if (status) updated.status = String(status);

    await prisma.order.updateMany({ where: { orderNumber: String(orderNumber) }, data: updated });

    const text = `СДЭК уведомление: order ${orderNumber}\nТрек: ${cdekNumber || '-'}\nСтатус: ${status || '-'}`;
    await notifyAdminsText(text);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('sdek webhook error', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
