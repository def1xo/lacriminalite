'use client';
import { useEffect, useState } from 'react';

type OrderItem = {
  id: number;
  productTitle: string;
  price: number;
  quantity: number;
  size?: string;
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingCost?: number;
  items: OrderItem[];
  createdAt: string;
  sdekTracking?: string | null;
  paymentId?: string | null;
};

export default function AdminOrdersPage() {
  const [secret, setSecret] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('sdek');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      const json = await res.json();
      setOrders(json.orders || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  async function openOrder(id:number) {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', payload: { id } })
      });
      const json = await res.json();
      setSelected(json.order || null);
    } catch (e) { console.error(e); }
  }

  async function updateStatus(id:number, status:string) {
    try {
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ action: 'updateStatus', payload: { id, status } })
      });
      await load();
    } catch (e) { console.error(e); }
  }

  async function setTrack() {
    if (!selected) return;
    try {
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ action: 'setTracking', payload: { id: selected.id, tracking, carrier } })
      });
      await load();
      setSelected(null);
      setTracking('');
    } catch (e) { console.error(e); }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Заказы — админ</h1>
        <div className="mb-4 flex gap-2 items-center">
          <input placeholder="ADMIN_API_SECRET" value={secret} onChange={(e)=>setSecret(e.target.value)} className="border px-3 py-2 rounded w-80" />
          <button onClick={load} className="px-4 py-2 bg-black text-white rounded">Обновить</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {loading && <div>Загрузка...</div>}
          {orders.map(o => (
            <div key={o.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="font-medium">#{o.orderNumber} — {o.totalAmount} ₽</div>
                <div className="text-sm text-gray-600">Статус: {o.status}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openOrder(o.id)} className="px-3 py-1 border rounded">Открыть</button>
                <button onClick={()=>updateStatus(o.id,'shipped')} className="px-3 py-1 bg-green-600 text-white rounded">Отправлен</button>
                <button onClick={()=>updateStatus(o.id,'canceled')} className="px-3 py-1 bg-red-600 text-white rounded">Отменить</button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="text-xl mb-2">Заказ {selected.orderNumber}</h2>
            <div className="mb-2">Сумма: {selected.totalAmount} ₽</div>
            <div className="mb-2">Статус: {selected.status}</div>
            <div className="mb-2">Оплата: {selected.paymentId || '-'}</div>
            <div className="mb-4">
              <h3 className="font-medium">Товары:</h3>
              {selected.items.map(it => (
                <div key={it.id} className="text-sm">{it.productTitle} — {it.quantity} шт — {it.size || '-'}</div>
              ))}
            </div>
            <div className="mb-4 flex gap-2">
              <input placeholder="tracking" value={tracking} onChange={(e)=>setTracking(e.target.value)} className="border px-3 py-2 rounded" />
              <select value={carrier} onChange={(e)=>setCarrier(e.target.value)} className="border px-3 py-2 rounded">
                <option value="sdek">СДЭК</option>
                <option value="yandex">Яндекс</option>
              </select>
              <button onClick={setTrack} className="px-3 py-2 bg-black text-white rounded">Присвоить трек</button>
            </div>
            <div>
              <button onClick={()=>setSelected(null)} className="px-3 py-1 border rounded">Закрыть</button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
