import { useState } from 'react';
import { ChevronUp, ChevronDown, Package, Shield, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  loyaltyDiscount: number;
  total: number;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function OrderSummary({
  items,
  subtotal,
  discount,
  shipping,
  loyaltyDiscount,
  total,
  currentStep,
  onStepChange,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-xl border sticky top-24">
      {/* Заголовок */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Ваш заказ</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {itemCount} товара на сумму {formatPrice(total)}
        </div>
      </div>

      {/* Содержимое */}
      {isExpanded && (
        <>
          {/* Товары */}
          <div className="p-6 border-b max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                      {item.quantity}
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg">
                      {/* Здесь будет Image из next/image */}
                      <div className="w-full h-full bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      Размер: {item.size}
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
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Стоимость товаров</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Скидка {loyaltyDiscount > 0 ? `(${loyaltyDiscount}%)` : ''}
                </span>
                <span className="font-medium text-green-600">
                  -{formatPrice(discount)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Доставка</span>
              <span className="font-medium">
                {shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Итого</span>
                <span className="text-2xl font-bold">{formatPrice(total)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Включая налоги и сборы
              </p>
            </div>
          </div>

          {/* Быстрая навигация по шагам */}
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-2">
              <button
                onClick={() => onStepChange(1)}
                className={`w-full text-left p-3 rounded-lg ${
                  currentStep === 1
                    ? 'bg-black text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">Контактные данные</div>
                  {currentStep > 1 && (
                    <div className="text-sm text-green-600">✓ Заполнено</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => currentStep > 1 && onStepChange(2)}
                className={`w-full text-left p-3 rounded-lg ${
                  currentStep === 2
                    ? 'bg-black text-white'
                    : currentStep > 2
                    ? 'bg-white hover:bg-gray-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={currentStep < 2}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">Доставка и оплата</div>
                  {currentStep > 2 && (
                    <div className="text-sm text-green-600">✓ Выбрано</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => currentStep > 2 && onStepChange(3)}
                className={`w-full text-left p-3 rounded-lg ${
                  currentStep === 3
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={currentStep < 3}
              >
                <div className="font-medium">Подтверждение</div>
              </button>
            </div>
          </div>

          {/* Гарантии */}
          <div className="p-6 border-t">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Гарантия безопасности</div>
                  <div className="text-sm text-gray-600">
                    Ваши данные защищены
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Легкий возврат</div>
                  <div className="text-sm text-gray-600">
                    14 дней на возврат
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Быстрая отправка</div>
                  <div className="text-sm text-gray-600">
                    В день заказа
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}