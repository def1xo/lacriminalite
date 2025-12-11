'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Package, 
  Star, 
  MapPin, 
  Settings, 
  LogOut,
  ChevronRight,
  CreditCard,
  Shield,
  Bell,
  Heart,
  History
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';
import LoyaltyProgress from '@/components/loyalty/LoyaltyProgress/LoyaltyProgress';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { loyalty, isLoading: loyaltyLoading } = useLoyalty();
  const { orders, getRecentOrders, isLoading: ordersLoading } = useOrders();
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  useEffect(() => {
    if (orders.length > 0) {
      const recent = getRecentOrders(3);
      setRecentOrders(recent);
      
      const totalSpent = orders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, order) => sum + order.total, 0);
      
      const pending = orders.filter(o => 
        ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)
      ).length;

      setStats({
        totalOrders: orders.length,
        totalSpent,
        pendingOrders: pending
      });
    }
  }, [orders]);

  const loadProfileData = async () => {
    // Данные уже загружаются через хуки
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const menuItems = [
    {
      title: 'Мои заказы',
      description: 'История и статус заказов',
      icon: Package,
      href: '/profile/orders',
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} активных` : null,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Программа лояльности',
      description: 'Бонусы и скидки',
      icon: Star,
      href: '/profile/loyalty',
      badge: loyalty?.level ? `Уровень ${loyalty.level}` : 'Новичок',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Избранное',
      description: 'Сохраненные товары',
      icon: Heart,
      href: '/profile/wishlist',
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Адреса доставки',
      description: 'Мои адреса',
      icon: MapPin,
      href: '/profile/addresses',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Платежные методы',
      description: 'Карты и способы оплаты',
      icon: CreditCard,
      href: '/profile/payment-methods',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Настройки',
      description: 'Личные данные и безопасность',
      icon: Settings,
      href: '/profile/settings',
      color: 'bg-gray-100 text-gray-600'
    },
    {
      title: 'Уведомления',
      description: 'Настройка оповещений',
      icon: Bell,
      href: '/profile/notifications',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      title: 'История просмотров',
      description: 'Недавно просмотренные товары',
      icon: History,
      href: '/profile/history',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Привет, {user.firstName || 'пользователь'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Добро пожаловать в ваш личный кабинет
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Левая колонка - меню */}
            <div className="lg:col-span-2">
              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.totalOrders}</div>
                      <div className="text-gray-600">Всего заказов</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {formatPrice(stats.totalSpent)}
                      </div>
                      <div className="text-gray-600">Всего потрачено</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {loyalty?.discount || 0}%
                      </div>
                      <div className="text-gray-600">Текущая скидка</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Прогресс лояльности */}
              {loyalty && (
                <div className="bg-white rounded-xl border p-6 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Программа лояльности</h2>
                      <p className="text-gray-600 text-sm">
                        Ваш прогресс и ближайший уровень
                      </p>
                    </div>
                  </div>
                  <LoyaltyProgress
                    currentSpent={loyalty.totalSpent}
                    totalSpent={loyalty.totalSpent}
                    level={loyalty.level}
                    discount={loyalty.discount}
                  />
                </div>
              )}

              {/* Меню */}
              <div className="bg-white rounded-xl border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Меню</h2>
                </div>
                <div className="divide-y">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${item.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-sm text-gray-600">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {item.badge && (
                            <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {item.badge}
                            </div>
                          )}
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Последние заказы */}
              {recentOrders.length > 0 && (
                <div className="mt-8 bg-white rounded-xl border">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Последние заказы</h2>
                      <Link
                        href="/profile/orders"
                        className="text-black hover:text-gray-800 font-medium"
                      >
                        Все заказы
                      </Link>
                    </div>
                  </div>
                  <div className="divide-y">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50">
                        <Link href={`/profile/orders/${order.id}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">
                                Заказ #{order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(order.createdAt)}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status === 'PENDING' && 'Ожидает оплаты'}
                                  {order.status === 'PROCESSING' && 'В обработке'}
                                  {order.status === 'SHIPPED' && 'Отправлен'}
                                  {order.status === 'DELIVERED' && 'Доставлен'}
                                  {order.status === 'CANCELLED' && 'Отменен'}
                                </div>
                                {order.trackingNumber && (
                                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    Трекинг: {order.trackingNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatPrice(order.total)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.items?.length || 0} товаров
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Правая колонка - информация */}
            <div className="lg:col-span-1 space-y-6">
              {/* Личная информация */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-black text-white rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg">Личная информация</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Имя и фамилия</div>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Телефон</div>
                    <div className="font-medium">
                      {user.phone || 'Не указан'}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Link
                      href="/profile/settings"
                      className="text-black hover:text-gray-800 font-medium flex items-center gap-2"
                    >
                      Редактировать профиль
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Безопасность */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg">Безопасность</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Двухфакторная аутентификация</div>
                      <div className="text-sm text-gray-600">
                        Повысьте безопасность аккаунта
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      Выкл
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Активные сессии</div>
                      <div className="text-sm text-gray-600">
                        1 устройство
                      </div>
                    </div>
                    <Link
                      href="/profile/sessions"
                      className="text-black hover:text-gray-800 text-sm"
                    >
                      Управление
                    </Link>
                  </div>
                </div>
              </div>

              {/* Выход */}
              <div className="bg-white rounded-xl border p-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full py-3 text-red-600 hover:text-red-800 font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  Выйти из аккаунта
                </button>
              </div>

              {/* Помощь */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold mb-3">Нужна помощь?</h4>
                <div className="space-y-3 text-sm">
                  <Link 
                    href="/contacts" 
                    className="block text-blue-700 hover:text-blue-900"
                  >
                    📞 Связаться с поддержкой
                  </Link>
                  <Link 
                    href="/delivery" 
                    className="block text-blue-700 hover:text-blue-900"
                  >
                    🚚 Информация о доставке
                  </Link>
                  <Link 
                    href="/returns" 
                    className="block text-blue-700 hover:text-blue-900"
                  >
                    🔄 Условия возврата
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}