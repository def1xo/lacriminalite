'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

const statusFilters = [
  { id: 'all', label: 'Все заказы' },
  { id: 'pending', label: 'Ожидают оплаты' },
  { id: 'processing', label: 'В обработке' },
  { id: 'shipped', label: 'Отправлены' },
  { id: 'delivered', label: 'Доставлены' },
  { id: 'cancelled', label: 'Отменены' }
];

const timeFilters = [
  { id: 'all', label: 'За все время' },
  { id: 'month', label: 'За последний месяц' },
  { id: '3months', label: 'За 3 месяца' },
  { id: 'year', label: 'За год' }
];

export default function OrdersPage() {
  const router = useRouter();
  const { orders, isLoading, getOrdersByStatus } = useOrders();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (orders.length > 0) {
      filterOrders();
    }
  }, [orders, statusFilter, timeFilter, searchQuery]);

  const filterOrders = () => {
    let filtered = [...orders];

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (statusFilter === 'pending') return order.status === 'PENDING';
        if (statusFilter === 'processing') return order.status === 'PROCESSING';
        if (statusFilter === 'shipped') return order.status === 'SHIPPED';
        if (statusFilter === 'delivered') return order.status === 'DELIVERED';
        if (statusFilter === 'cancelled') return order.status === 'CANCELLED';
        return true;
      });
    }

    // Фильтр по времени
    const now = new Date();
    if (timeFilter !== 'all') {
      const cutoffDate = new Date();
      if (timeFilter === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (timeFilter === '3months') {
        cutoffDate.setMonth(now.getMonth() - 3);
      } else if (timeFilter === 'year') {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= cutoffDate
      );
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.items?.some((item: any) => 
          item.product?.name.toLowerCase().includes(query)
        )
      );
    }

    // Сортировка по дате (новые сначала)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'PROCESSING':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
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

  const handleExportOrders = async () => {
    try {
      const response = await fetch('/api/orders/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
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
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
                <p className="text-gray-600 mt-2">
                  {filteredOrders.length} заказов найдено
                </p>
              </div>
              <button
                onClick={handleExportOrders}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Download className="h-5 w-5" />
                Экспорт
              </button>
            </div>
          </div>

          {/* Фильтры и поиск */}
          <div className="mb-8 space-y-4">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по номеру заказа или товару..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-3">
              {/* Статусы */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-5 w-5" />
                  {statusFilters.find(f => f.id === statusFilter)?.label}
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {statusFilters.map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => {
                            setStatusFilter(filter.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                            statusFilter === filter.id ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Период */}
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-transparent focus:outline-none"
                >
                  {timeFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Сброс фильтров */}
              {(statusFilter !== 'all' || timeFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setTimeFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-800"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          </div>

          {/* Список заказов */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Заказы не найдены</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || timeFilter !== 'all'
                  ? 'Попробуйте изменить параметры поиска'
                  : 'У вас еще нет заказов'}
              </p>
              {!searchQuery && statusFilter === 'all' && timeFilter === 'all' && (
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Начать покупки
                  <ChevronRight className="h-5 w-5" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border hover:shadow-md transition-shadow">
                  <Link href={`/profile/orders/${order.id}`}>
                    {/* Заголовок заказа */}
                    <div className="p-6 border-b">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(order.status)}
                          <div>
                            <div className="font-bold">Заказ #{order.orderNumber}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {formatPrice(order.total)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.items?.length || 0} товара
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Товары */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items?.slice(0, 3).map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                              {/* Image component here */}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {item.product?.name || 'Товар'}
                              </div>
                              <div className="text-sm text-gray-600">
                                Размер: {item.size}, Количество: {item.quantity}
                              </div>
                            </div>
                            <div className="font-bold">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}

                        {order.items && order.items.length > 3 && (
                          <div className="text-center text-gray-600 pt-2 border-t">
                            + еще {order.items.length - 3} товара
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                      <div className="flex flex-wrap gap-3">
                        {order.status === 'DELIVERED' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Действие для повторного заказа
                            }}
                            className="px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white"
                          >
                            Заказать снова
                          </button>
                        )}
                        
                        {order.status === 'SHIPPED' && order.trackingNumber && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Открыть трекинг
                              window.open(`https://www.cdek.ru/ru/tracking?order_id=${order.trackingNumber}`, '_blank');
                            }}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white"
                          >
                            Отследить заказ
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Скачать чек
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                          Скачать чек
                        </button>

                        {order.status === 'PENDING' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Оплатить заказ
                              router.push(`/checkout/pay/${order.id}`);
                            }}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                          >
                            Оплатить заказ
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}