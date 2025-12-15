const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ADMIN_CHAT_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

export async function notifyAdminsText(text: string) {
  if (!BOT_TOKEN || !ADMIN_CHAT_IDS.length) return;
  for (const id of ADMIN_CHAT_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: Number(id), text, parse_mode: 'Markdown' }),
      });
    } catch (e) {
      console.error('notifyAdminsText fail', e);
    }
  }
}

export function buildOrderMessage(order: any) {
  const lines: string[] = [];
  lines.push(`📦 Order #${order.orderNumber}`);
  for (const [i, it] of (order.items || []).entries()) {
    lines.push(`${i + 1}. ${it.productTitle || it.title} — ${it.price} (${it.quantity} x ${it.price}) Размер: ${it.size || '-'}`);
  }
  lines.push(`\nСтатус: ${order.status || '-'}`);
  if (order.shippingCost) lines.push(`Доставка: ${order.shippingCost}`);
  if (order.sdekTracking) lines.push(`Трек СДЭК: ${order.sdekTracking}`);
  if (order.paymentId) lines.push(`Payment ID: ${order.paymentId}`);
  if (order.purchaser) {
    lines.push(`\nПокупатель:\n${order.purchaser.name || '-'}\n${order.purchaser.email || '-'}\n${order.purchaser.phone || '-'}`);
  }
  return lines.join('\n');
}
