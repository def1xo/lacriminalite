const SDEK_BASE = process.env.SDEK_API_BASE || 'https://api.cdek.ru';
const SDEK_TOKEN = process.env.SDEK_API_TOKEN || '';

export async function createCdekShipment(order: any) {
  if (!SDEK_TOKEN) {
    return { ok: false, note: 'no-token', mock: true };
  }
  const payload = {
    recipient: {
      name: order.purchaser?.name,
      phone: order.purchaser?.phone,
      email: order.purchaser?.email,
      address: {
        address: order.address?.full || order.address || '',
        city: order.address?.city || '',
        index: order.address?.postalCode || ''
      }
    },
    items: (order.items || []).map((it: any) => ({ name: it.productTitle || it.title, count: it.quantity || 1, price: it.price || 0 }))
  };
  try {
    const res = await fetch(`${SDEK_BASE}/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SDEK_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return { ok: true, raw: json, cdekNumber: json.cdek_number || json.order?.cdek_number || null, uuid: json.uuid || null };
  } catch (e: any) {
    console.error('createCdekShipment error', e);
    return { ok: false, error: String(e) };
  }
}
