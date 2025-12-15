#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async function main() {
  try {
    const minutes = Number(process.env.ORDER_RESERVE_MINUTES || '30');
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);

    const expired = await prisma.order.findMany({
      where: {
        status: 'pending',
        createdAt: { lt: cutoff }
      },
      include: { items: true }
    });

    console.log(`Found ${expired.length} expired orders older than ${minutes} minutes.`);

    for (const order of expired) {
      const tx = [];
      for (const it of order.items) {
        const product = await prisma.product.findUnique({ where: { id: Number(it.productId) } });
        if (!product) continue;
        const sizeStock = product.sizeStock || {};
        const newStock = { ...(sizeStock) };
        const sizeKey = it.size || 'UNSPEC';
        newStock[sizeKey] = (Number(newStock[sizeKey] || 0) + Number(it.quantity || 0));
        tx.push(prisma.product.update({ where: { id: product.id }, data: { sizeStock: newStock } }));
      }
      tx.push(prisma.order.update({ where: { id: order.id }, data: { status: 'canceled', canceledAt: new Date() } }));
      await prisma.$transaction(tx);
      console.log(`Order ${order.orderNumber} canceled and stock restored.`);
    }

    console.log('Done.');
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error in revert_reservations', e);
    try { await prisma.$disconnect(); } catch {}
    process.exit(1);
  }
})();
