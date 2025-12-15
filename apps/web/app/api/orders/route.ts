import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPayment } from '@/lib/services/yookassaService';
import { createCdekShipment } from '@/lib/services/sdekService';
import { notifyAdminsText, buildOrderMessage } from '@/lib/utils/notify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, purchaser, address, shippingMethod } = body;
    if (!cart || !Array.isArray(cart.items) || !purchaser) return NextResponse.json({ error: 'invalid payload' }, { status: 400 });

    const orderNumber = String(Date.now()); // simple unique orderNumber; can be improved
    const itemsData = [];

    for (const c of cart.items) {
      if (!c.productId || !c.size || !c.quantity) return NextResponse.json({ error: 'invalid cart item' }, { status: 400 });

      const product = await prisma.product.findUnique({ where: { id: Number(c.productId) } });
      if (!product) return NextResponse.json({ error: `product ${c.productId} not found` }, { status: 404 });

      const sizeStock = product.sizeStock || {};
      const avail = (sizeStock[c.size] ?? 0);
      if (avail < c.quantity) return NextResponse.json({ error: `Not enough stock for ${product.title} size ${c.size}` }, { status: 409 });

      const newSizeStock = { ...(product.sizeStock || {}) };
      newSizeStock[c.size] = avail - c.quantity;
      await prisma.product.update({ where: { id: product.id }, data: { sizeStock: newSizeStock } });

      itemsData.push({
        productId: product.id,
        productTitle: product.title,
        price: product.price,
        quantity: c.quantity,
        size: c.size
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'pending',
        totalAmount: cart.total || itemsData.reduce((s: number, it: any) => s + it.price * it.quantity, 0),
        items: { create: itemsData },
        shippingCost: body.shippingCost ?? 0,
        userId: purchaser.userId ?? null,
        createdAt: new Date()
      },
      include: { items: true }
    });

    let shipment = null;
    if (shippingMethod === 'sdek') {
      const shipRes = await createCdekShipment({
        purchaser,
        address,
        items: itemsData,
        orderNumber
      });
      if (shipRes?.ok && shipRes.cdekNumber) {
        shipment = { cdekNumber: shipRes.cdekNumber };
        await prisma.order.update({ where: { id: order.id }, data: { sdekTracking: shipRes.cdekNumber, sdekUuid: shipRes.uuid || null } });
      } else if (shipRes?.mock) {
        // no token configured — leave blank
      } else {
        console.warn('sdek create failed', shipRes);
      }
    }

    const returnUrl = `${process.env.SITE_URL?.replace(/\/$/, '') || ''}/checkout/success?order=${orderNumber}`;
    const payment = await createPayment(order.totalAmount + (order.shippingCost || 0), orderNumber, returnUrl);

    await prisma.order.update({ where: { id: order.id }, data: { paymentId: `YooKassa: ${payment.id}` } });

    const confirmationUrl = payment.confirmation?.confirmation_url || payment.confirmation?.url || null;

    const adminMsg = buildOrderMessage({
      orderNumber,
      items: itemsData,
      status: order.status,
      shippingCost: order.shippingCost,
      purchaser,
      totalAmount: order.totalAmount,
      paymentId: `YooKassa: ${payment.id}`,
      sdekTracking: shipment?.cdekNumber || null
    });
    await notifyAdminsText(adminMsg);

    return NextResponse.json({ ok: true, orderNumber, confirmationUrl });
  } catch (err: any) {
    console.error('create order error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
