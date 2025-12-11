'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Printer, 
  Download,
  ArrowRight,
  Home,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { formatPrice } from '@/lib/utils/format';

interface OrderDetails {
  id: string;
  orderNumber: string;
  total: number;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping: {
    method: string;
    address: string;
    estimatedDelivery: string;
  };
  payment: {
    method: string;
    status: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      // Если нет orderId, пытаемся получить из sessionStorage
      const savedOrder = sessionStorage.getItem('lastOrder');
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
        setLoading(false);
      } else {
        router.push('/cart');
      }
    }
  }, [orderId, router]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        // Сохраняем для повторного использования
        sessionStorage.setItem('lastOrder', JSON.stringify(data));
      } else {
        throw new Error('Заказ не найден');
      }
    } catch (error) {
      setError('Не удалось загрузить детали заказа');
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/orders/${order?.id}/invoice`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${order?.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-pulse space-y-6">
              <div className="h-16 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
            <p className="text-gray-600 mb-8">
              {error || 'Не удалось найти информацию о заказе'}
            </p>
            <Button onClick={() => router.push('/cart')}>
              Вернуться в корзину
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок успеха */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Заказ успешно оформлен!
            </h1>
            <p className="text-gray-600 text-lg">
              Номер вашего заказа: <span className="font-bold text-black">{order.orderNumber}</span>
            </p>
            <p className="text-gray-600 mt-2">
              Подробности отправлены на email: {order.customer.email}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Левая колонка - детали заказа */}
            <div className="lg:col-span-2">
              {/* Статус заказа */}
              <div className="bg-white rounded-xl border p-6 mb-6">
                <h2 className="text-xl font-bold mb-6">Статус заказа</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Заказ собран</div>
                        <div className="text-sm text-gray-600">
                          Товары готовы к отправке
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Сегодня
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Передан в доставку</div>
                        <div className="text-sm text-gray-600">
                          Ожидается в течение 24 часов
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Завтра
                    </div>
                  </div>
                </div>
              </div>

              {/* Детали заказа */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-6">Детали заказа</h2>
                
                {/* Товары */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Товары</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            Размер: {item.size}, Количество: {item.quantity}
                          </div>
                        </div>
                        <div className="font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Итоги */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Стоимость товаров:</span>
                    <span className="font-medium">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Доставка:</span>
                    <span className="font-medium">
                      {order.shipping.method === 'pickup' ? 'Бесплатно' : formatPrice(300)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-bold">Итого:</span>
                    <span className="text-xl font-bold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Информация о доставке */}
              <div className="bg-white rounded-xl border p-6 mt-6">
                <h2 className="text-xl font-bold mb-6">Информация о доставке</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Адрес доставки</h3>
                    <div className="space-y-1">
                      <p className="text-gray-700">{order.shipping.address}</p>
                      <p className="text-sm text-gray-600">
                        Ориентировочная доставка: {order.shipping.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Способ доставки</h3>
                    <p className="text-gray-700">
                      {order.shipping.method === 'sdek' ? 'СДЭК' :
                       order.shipping.method === 'yandex' ? 'Яндекс Доставка' :
                       order.shipping.method === 'pickup' ? 'Самовывоз' : 'Почта России'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - действия */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Контактная информация */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold mb-4">Контактная информация</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{order.customer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Телефон</div>
                        <div className="font-medium">{order.customer.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Действия */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold mb-4">Действия</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="w-full justify-center"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Распечатать чек
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="w-full justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Скачать PDF
                    </Button>
                    <Link href={`/profile/orders/${order.id}`}>
                      <Button className="w-full justify-center">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Отслеживать заказ
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Что дальше */}
                <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Что дальше?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        1
                      </div>
                      <span className="text-sm">
                        Получите email с подтверждением заказа
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        2
                      </div>
                      <span className="text-sm">
                        Следите за статусом в личном кабинете
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        3
                      </div>
                      <span className="text-sm">
                        Получите SMS с трек-номером
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Кнопки навигации */}
                <div className="space-y-3">
                  <Link href="/catalog">
                    <Button className="w-full justify-center" variant="outline">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Продолжить покупки
                    </Button>
                  </Link>
                  <Link href="/profile/orders">
                    <Button className="w-full justify-center">
                      <Home className="h-4 w-4 mr-2" />
                      Мои заказы
                    </Button>
                  </Link>
                </div>

                {/* Помощь */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold mb-2">Нужна помощь?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Если у вас есть вопросы по заказу, свяжитесь с нами:
                  </p>
                  <div className="space-y-2 text-sm">
                    <a href="mailto:support@lacriminalite.ru" className="block hover:underline">
                      ✉️ support@lacriminalite.ru
                    </a>
                    <a href="tel:+79999999999" className="block hover:underline">
                      📞 +7 (999) 999-99-99
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}