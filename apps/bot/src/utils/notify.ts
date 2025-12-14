// apps/bot/src/utils/notify.ts
import fetch from 'node-fetch';
import { TELEGRAM_ADMIN_CHAT_IDS, BOT_TOKEN } from '../config';

export function buildOrderMessage(order: any): string {
  // order должен содержать orderNumber, items[], shippingCost, address, fullName, comment, totalAmount, paymentId, purchaser info
  const lines: string[] = [];
  lines.push(`📦 *Order #${order.orderNumber}*`);
  for (const [i, it] of (order.items || []).entries()) {
    lines.push(`${i + 1}. ${it.title || it.productTitle} — ${it.price} (${it.quantity} x ${it.price}) Размер: ${it.size || '-'}`);
  }
  lines.push(`\n*Статус:* ${order.status || '-'}`);
  if (order.shippingCost) lines.push(`Доставка (СДЭК): ${order.shippingCost}`);
  if (order.address) {
    lines.push(`Адрес: ${order.address}`);
  }
  if (order.fullName) lines.push(`ФИО: ${order.fullName}`);
  lines.push(`Payment Amount: ${order.totalAmount} RUB`);
  if (order.paymentId) lines.push(`Payment ID: ${order.paymentId}`);
  if (order.sdekTracking) lines.push(`Трек СДЭК: ${order.sdekTracking}`);
  if (order.purchaser) {
    lines.push(`\nПокупатель:\nName: ${order.purchaser.name || '-'}\nEmail: ${order.purchaser.email || '-'}\nPhone: ${order.purchaser.phone || '-'}`);
  }
  if (order.extra) {
    lines.push(`\nДоп. информация:\n${order.extra}`);
  }
  return lines.join('\n');
}

export async function notifyAdminsOrder(order: any) {
  const text = buildOrderMessage(order);
  if (!BOT_TOKEN) {
    console.warn('BOT_TOKEN not set, skip notify');
    return;
  }
  for (const id of TELEGRAM_ADMIN_CHAT_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text, parse_mode: 'Markdown' }),
      });
    } catch (e) {
      console.error('notify admin fail', e);
    }
  }
}
