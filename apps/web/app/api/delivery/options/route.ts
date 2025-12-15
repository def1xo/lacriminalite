import { NextRequest, NextResponse } from 'next/server';
import { calculateYandexDelivery } from '@/lib/services/yandexDeliveryService';
import { createCdekShipment } from '@/lib/services/sdekService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, address } = body;
    if (!cart) return NextResponse.json({ error: 'cart required' }, { status: 400 });

    const results: any[] = [];

    // Yandex estimates (uses service; returns mock if no token)
    try {
      const yd = await calculateYandexDelivery({ cart, address });
      if (yd.ok) {
        // adapt to common format
        results.push({ carrier: 'yandex', label: 'Яндекс.Доставка', estimate: yd.data || yd.estimates || yd });
      } else if (yd.mock) {
        results.push({ carrier: 'yandex', label: 'Яндекс.Доставка (оценка)', estimate: yd.estimates });
      } else {
        results.push({ carrier: 'yandex', label: 'Яндекс.Доставка', error: yd.error || 'error' });
      }
    } catch (e) {
      results.push({ carrier: 'yandex', label: 'Яндекс.Доставка', error: String(e) });
    }

    // СДЭК — we try a lightweight create to obtain cost if token present; otherwise mock
    try {
      // NOTE: createCdekShipment normally creates a shipment — here we call it only if SDEK token exists.
      const sdek = await createCdekShipment({ purchaser: null, address, items: cart.items || [], orderNumber: `estimate-${Date.now()}` });
      if (sdek.ok) {
        results.push({ carrier: 'sdek', label: 'СДЭК', estimate: { price: sdek.raw?.price || sdek.cdekNumber || 0 }, raw: sdek.raw });
      } else if (sdek.mock) {
        results.push({ carrier: 'sdek', label: 'СДЭК (оценка)', estimate: [{ price: 700, days: 5 }] });
      } else {
        results.push({ carrier: 'sdek', label: 'СДЭК', error: sdek.error || 'error' });
      }
    } catch (e) {
      results.push({ carrier: 'sdek', label: 'СДЭК', error: String(e) });
    }

    return NextResponse.json({ ok: true, options: results });
  } catch (err: any) {
    console.error('delivery/options error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
