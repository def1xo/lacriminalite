'use client';
import { useEffect, useState } from 'react';

type CartItem = { productId: number; title?: string; price: number; quantity: number; size?: string };
type DeliveryOption = { carrier: string; label: string; estimate: any; raw?: any };

export default function CheckoutPage() {
  const [cart, setCart] = useState<{ items: CartItem[]; total?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchaser, setPurchaser] = useState({ name: '', email: '', phone: '', userId: null });
  const [address, setAddress] = useState({ full: '', city: '', postalCode: '' });
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    try {
      const res = await fetch('/api/cart');
      const json = await res.json();
      setCart(json || { items: [], total: 0 });
    } catch (e) {
      console.error(e);
      setCart({ items: [], total: 0 });
    }
  }

  async function calcDelivery() {
    if (!cart) return;
    setLoading(true);
    setStatus('Получаем варианты доставки...');
    try {
      const res = await fetch('/api/delivery/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, address })
      });
      const json = await res.json();
      if (json.ok) {
        setOptions(json.options || []);
        setStatus(null);
      } else {
        setStatus('Ошибка получения вариантов доставки');
      }
    } catch (e) {
      console.error(e);
      setStatus('Ошибка связи');
    } finally { setLoading(false); }
  }

  function computeTotal() {
    const itemsTotal = cart?.items.reduce((s, it) => s + it.price * it.quantity, 0) || 0;
    return itemsTotal + (shippingCost || 0);
  }

  async function submitOrder() {
    if (!cart || !purchaser.name || !purchaser.phone) {
      setStatus('Заполните имя и телефон');
      return;
    }
    setLoading(true);
    setStatus('Создаём заказ...');
    try {
      const body = {
        cart,
        purchaser,
        address,
        shippingMethod: selectedDelivery,
        shippingCost,
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.ok) {
        if (json.confirmationUrl) {
          window.location.href = json.confirmationUrl;
        } else {
          setStatus('Заказ создан. Номер: ' + (json.orderNumber || '—'));
        }
      } else {
        setStatus('Ошибка: ' + (json.error || 'unknown'));
      }
    } catch (e:any) {
      console.error(e);
      setStatus('Ошибка сервера: ' + (e.message || String(e)));
    } finally { setLoading(false); }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Оформление заказа</h1>

        <section className="mb-6">
          <h2 className="font-medium mb-2">Корзина</h2>
          {cart?.items?.length ? (
            <div className="space-y-2">
              {cart.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>{it.title || `Товар ${it.productId}`} x {it.quantity} ({it.size || '-'})</div>
                  <div>{it.price * it.quantity} ₽</div>
                </div>
              ))}
              <div className="mt-2 font-medium">Итого: {cart.total ?? cart.items.reduce((s,i)=>s+i.price*i.quantity,0)} ₽</div>
            </div>
          ) : <div>Корзина пуста</div>}
        </section>

        <section className="mb-6">
          <h2 className="font-medium mb-2">Контакты</h2>
          <input value={purchaser.name} onChange={(e)=>setPurchaser({...purchaser, name:e.target.value})} placeholder="ФИО" className="w-full border p-2 rounded mb-2" />
          <input value={purchaser.email} onChange={(e)=>setPurchaser({...purchaser, email:e.target.value})} placeholder="Email" className="w-full border p-2 rounded mb-2" />
          <input value={purchaser.phone} onChange={(e)=>setPurchaser({...purchaser, phone:e.target.value})} placeholder="Телефон" className="w-full border p-2 rounded mb-2" />
        </section>

        <section className="mb-6">
          <h2 className="font-medium mb-2">Адрес</h2>
          <input value={address.full} onChange={(e)=>setAddress({...address, full:e.target.value})} placeholder="Улица, дом, квартира" className="w-full border p-2 rounded mb-2" />
          <div className="flex gap-2">
            <input value={address.city} onChange={(e)=>setAddress({...address, city:e.target.value})} placeholder="Город" className="w-1/2 border p-2 rounded mb-2" />
            <input value={address.postalCode} onChange={(e)=>setAddress({...address, postalCode:e.target.value})} placeholder="Индекс" className="w-1/2 border p-2 rounded mb-2" />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-medium mb-2">Доставка</h2>
          <button onClick={calcDelivery} className="px-4 py-2 bg-gray-800 text-white rounded mb-3">Посчитать варианты доставки</button>
          {loading && <div>Загрузка...</div>}
          {options.length > 0 && (
            <div className="space-y-3">
              {options.map((opt, i) => {
                const price = opt.estimate?.price ?? (Array.isArray(opt.estimate) ? opt.estimate[0]?.price : undefined) ?? 0;
                return (
                  <div key={i} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-sm text-gray-600">{JSON.stringify(opt.estimate).slice(0,120)}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-medium">{price} ₽</div>
                      <button onClick={() => { setSelectedDelivery(opt.carrier); setShippingCost(Number(price || 0)); }} className={`mt-2 px-3 py-1 rounded ${selectedDelivery === opt.carrier ? 'bg-black text-white' : 'border'}`}>Выбрать</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3">Выбранная доставка: <strong>{selectedDelivery || '-'}</strong> — {shippingCost} ₽</div>
        </section>

        <section className="mb-6">
          <h2 className="font-medium mb-2">Итого</h2>
          <div className="text-lg font-semibold">{computeTotal()} ₽</div>
        </section>

        <div className="flex gap-2">
          <button onClick={submitOrder} className="px-4 py-2 bg-black text-white rounded">Оплатить / Оформить</button>
          <div className="text-sm text-gray-600 self-center">{status}</div>
        </div>
      </div>
    </main>
  );
}
