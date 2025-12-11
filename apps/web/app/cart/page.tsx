'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Shield, 
  ArrowRight,
  Package,
  RefreshCw,
  Tag,
  X,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import CartItem from '@/components/cart/CartItem/CartItem';
import CartSummary from '@/components/cart/CartSummary/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart/EmptyCart';
import { formatPrice } from '@/lib/utils/format';

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart,
    getTotal,
    getItemCount,
    isLoading: cartLoading 
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Автоматически выбираем все товары при загрузке
  useEffect(() => {
    if (items.length > 0) {
      setSelectedItems(items.map(item => item.id));
    }
  }, [items]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = items.find(item => item.id === itemId);
    if (item) {
      updateQuantity(item.productId, item.size, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (item) {
      removeItem(item.productId, item.size);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Введите промокод');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');
    
    try {
      const response = await fetch('/api/cart/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode, items: selectedItems })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPromoSuccess(true);
        setPromoDiscount(data.discountAmount || 0);
      } else {
        setPromoError(data.error || 'Промокод не действителен');
        setPromoSuccess(false);
        setPromoDiscount(0);
      }
    } catch (error) {
      setPromoError('Ошибка при применении промокода');
      setPromoSuccess(false);
      setPromoDiscount(0);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleClearCart = () => {
    if (confirm('Очистить всю корзину?')) {
      clearCart();
      setSelectedItems([]);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Выберите хотя бы один товар для оформления заказа');
      return;
    }

    // Сохраняем выбранные товары в сессию для чекаута
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    
    // Если пользователь не авторизован, предлагаем войти
    if (!user) {
      if (confirm('Для оформления заказа требуется войти в аккаунт. Перейти на страницу входа?')) {
        router.push('/auth/login?redirect=/checkout');
      }
      return;
    }

    router.push('/checkout');
  };

  // Рассчитываем итоговую сумму для выбранных товаров
  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = selectedItemsData.reduce((sum, item) => sum + item.quantity, 0);
  const total = Math.max(0, subtotal - promoDiscount);

  if (cartLoading || authLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-40 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Корзина
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <ShoppingBag className="h-5 w-5" />
              <span>{getItemCount()} товара на сумму {formatPrice(getTotal())}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Левая колонка - товары */}
            <div className="lg:col-span-2">
              {/* Панель управления */}
              <div className="bg-white rounded-xl border p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === items.length && items.length > 0}
                        onChange={handleSelectAll}
                        className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm font-medium">Выбрать все ({items.length})</span>
                    </label>
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Очистить корзину
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Выбрано: {selectedItems.length} товаров
                  </div>
                </div>
              </div>

              {/* Список товаров */}
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItems.includes(item.id)}
                    onSelect={() => handleSelectItem(item.id)}
                    onQuantityChange={(newQuantity) => 
                      handleQuantityChange(item.id, newQuantity)
                    }
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))}
              </div>

              {/* Промокод */}
              <div className="mt-8 bg-white rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">Промокод</h3>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (promoError) setPromoError('');
                      }}
                      error={promoError}
                      disabled={isApplyingPromo}
                    />
                  </div>
                  <Button
                    onClick={handleApplyPromo}
                    loading={isApplyingPromo}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    variant="outline"
                  >
                    Применить
                  </Button>
                </div>

                {promoSuccess && promoDiscount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-700">
                        <Tag className="h-4 w-4" />
                        <span className="font-medium">Промокод применен!</span>
                      </div>
                      <div className="font-bold text-green-700">
                        -{formatPrice(promoDiscount)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPromoSuccess(false);
                        setPromoDiscount(0);
                        setPromoCode('');
                      }}
                      className="mt-2 text-sm text-green-600 hover:text-green-800"
                    >
                      Удалить промокод
                    </button>
                  </div>
                )}

                {/* Популярные промокоды */}
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Популярные промокоды:</p>
                  <div className="flex flex-wrap gap-2">
                    {['WELCOME10', 'SUMMER15', 'FIRSTORDER'].map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setPromoCode(code);
                          setPromoError('');
                          setPromoSuccess(false);
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:border-black hover:bg-gray-50"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - итог */}
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={subtotal}
                discount={promoDiscount}
                shipping={selectedItems.length > 0 ? 300 : 0} // Примерная стоимость доставки
                total={total}
                totalItems={totalItems}
                isLoading={false}
                onCheckout={handleCheckout}
              />

              {/* Преимущества */}
              <div className="mt-6 space-y-4">
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Бесплатная доставка</div>
                      <p className="text-sm text-gray-600">
                        При заказе от 10 000 ₽
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Безопасная оплата</div>
                      <p className="text-sm text-gray-600">
                        Картой, СБП, ЮMoney и другие способы
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Гарантия возврата</div>
                      <p className="text-sm text-gray-600">
                        Возврат в течение 14 дней
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Быстрая отправка</div>
                      <p className="text-sm text-gray-600">
                        Отправка в день заказа
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Продолжить покупки */}
              <div className="mt-6">
                <Link
                  href="/catalog"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                  Продолжить покупки
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}