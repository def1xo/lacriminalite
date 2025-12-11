'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Printer,
  Download,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface OrderTracking {
  status: string;
  location: string;
  date: string;
  description: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrderById, updateOrderStatus, isLoading } = useOrders();
  
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<OrderTracking[]>([]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    const orderData = await getOrderById(params.id as string);
    if (orderData) {
      setOrder(orderData);
      if (orderData.trackingNumber) {
        fetchTracking(orderData.trackingNumber);
      }
    }
  };

  const fetchTracking = async (trackingNumber: string) => {
    setIsTrackingLoading(true);
    try {
      const response = await fetch(`/api/orders/${params.id}/track`);
      if (response.ok) {
        const data = await response.json();
        setTracking(data.tracking || []);
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    window.print();
    setIsPrinting(false);
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-${order.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (confirm('Вы уверены, что хотите отменить заказ?')) {
      try {
        const success = await updateOrderStatus(params.id as string, 'CANCELLED');
        if (success) {
          loadOrder();
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'PROCESSING': return <Package className="h-6 w-6 text-blue-600" />;
      case 'SHIPPED': return <Truck className="h-6 w-6 text-purple-600" />;
      case 'DELIVERED': return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'CANCELLED': return <XCircle className="h-6 w-6 text-red-600" />;
      default: return <Package className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает оплаты';
      case 'PROCESSING': return 'В обработке';
      case 'SHIPPED': return 'Отправлен';
      case 'DELIVERED': return 'Доставлен';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Навигация */}
          <div className="mb-8">
            <Link
              href="/profile/orders"
              className="flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft className="h-5 w-5" />
              Назад к заказам
            </Link>
          </div>

          {/* Заголовок */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Заказ #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-2">
                Создан {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                  title="Распечатать"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                  title="Скачать чек"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Левая колонка - информация о заказе */}
            <div className="lg:col-span-2 space-y-8">
              {/* Товары */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-6">Товары в заказе</h2>
                <div className="space-y-6">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product?.images?.[0] || '/placeholder.jpg'}
                          alt={item.product?.name || 'Товар'}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/catalog/product/${item.product?.slug}`}
                              className="font-medium hover:text-red-600"
                            >
                              {item.product?.name || 'Товар'}
                            </Link>
                            <div className="text-sm text-gray-600 mt-1">
                              Артикул: {item.product?.sku || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Размер: {item.size}, Количество: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatPrice(item.price)} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Отслеживание */}
              {order.trackingNumber && (
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Отслеживание заказа</h2>
                    <div className="text-sm text-gray-600">
                      Номер накладной: {order.trackingNumber}
                    </div>
                  </div>
                  
                  {isTrackingLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-600 mt-2">Загружаем информацию...</p>
                    </div>
                  ) : tracking.length > 0 ? (
                    <div className="relative">
                      {/* Линия времени */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      <div className="space-y-8">
                        {tracking.map((step, index) => (
                          <div key={index} className="relative flex items-start gap-6">
                            <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {index === 0 ? (
                                <CheckCircle className="h-8 w-8 text-green-600" />
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <div className="pt-3">
                              <div className="font-semibold">{step.status}</div>
                              <div className="text-gray-600 text-sm mt-1">
                                {step.location}
                              </div>
                              <div className="text-gray-500 text-sm mt-1">
                                {formatDate(step.date)}
                              </div>
                              {step.description && (
                                <div className="text-gray-600 text-sm mt-2">
                                  {step.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Информация об отслеживании пока недоступна
                      </p>
                      <button
                        onClick={() => fetchTracking(order.trackingNumber)}
                        className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Обновить
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Действия */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-6">Действия с заказом</h2>
                <div className="flex flex-wrap gap-3">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => router.push(`/checkout/pay/${order.id}`)}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Оплатить заказ
                      </button>
                      <button
                        onClick={handleCancelOrder}
                        className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Отменить заказ
                      </button>
                    </>
                  )}
                  
                  {order.status === 'DELIVERED' && (
                    <>
                      <button
                        onClick={() => {
                          // Повторный заказ
                          const items = order.items.map((item: any) => ({
                            productId: item.productId,
                            size: item.size,
                            quantity: item.quantity
                          }));
                          localStorage.setItem('reorderItems', JSON.stringify(items));
                          router.push('/cart');
                        }}
                        className="px-6 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white"
                      >
                        Заказать снова
                      </button>
                      <button
                        onClick={() => {
                          // Возврат товара
                          router.push(`/returns/new?order=${order.id}`);
                        }}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Оформить возврат
                      </button>
                    </>
                  )}

                  <button
                    onClick={handlePrint}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Распечатать чек
                  </button>

                  <button
                    onClick={handleDownloadInvoice}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Скачать накладную
                  </button>
                </div>
              </div>
            </div>

            {/* Правая колонка - информация */}
            <div className="lg:col-span-1 space-y-6">
              {/* Сводка заказа */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-bold text-lg mb-6">Сводка заказа</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Стоимость товаров:</span>
                    <span className="font-medium">
                      {formatPrice(order.subtotal || order.total - (order.shippingCost || 0))}
                    </span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Скидка:</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Доставка:</span>
                    <span className="font-medium">
                      {order.shippingCost === 0 ? 'Бесплатно' : formatPrice(order.shippingCost)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">Итого:</span>
                      <span className="text-xl font-bold">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Информация о доставке */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <h3 className="font-bold">Доставка</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600">Способ доставки</div>
                    <div className="font-medium">{order.shippingMethod}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Адрес доставки</div>
                    <div className="font-medium">{order.shippingAddress}</div>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <div className="text-sm text-gray-600">Номер отслеживания</div>
                      <div className="font-medium">{order.trackingNumber}</div>
                    </div>
                  )}
                  {order.comment && (
                    <div>
                      <div className="text-sm text-gray-600">Комментарий</div>
                      <div className="text-gray-700">{order.comment}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация об оплате */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <h3 className="font-bold">Оплата</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600">Способ оплаты</div>
                    <div className="font-medium">{order.paymentMethod}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Статус оплаты</div>
                    <div className={`font-medium ${
                      order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus === 'PAID' ? 'Оплачен' : 'Ожидает оплаты'}
                    </div>
                  </div>
                  {order.yookassaId && (
                    <div>
                      <div className="text-sm text-gray-600">ID платежа</div>
                      <div className="font-medium text-sm">{order.yookassaId}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Контактная информация */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="font-bold">Контактная информация</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600">Имя и фамилия</div>
                    <div className="font-medium">{order.customerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{order.customerEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Телефон</div>
                    <div className="font-medium">{order.customerPhone}</div>
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