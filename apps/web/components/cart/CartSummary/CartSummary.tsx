import { Button } from '@/components/ui/Button/Button';
import { formatPrice } from '@/lib/utils/format';

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  totalItems: number;
  isLoading: boolean;
  onCheckout: () => void;
}

export default function CartSummary({
  subtotal,
  discount,
  shipping,
  total,
  totalItems,
  isLoading,
  onCheckout,
}: CartSummaryProps) {
  const isFreeShipping = shipping === 0;
  const freeShippingThreshold = 10000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="bg-white rounded-xl border p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Итого</h2>

      <div className="space-y-4">
        {/* Промежуточные суммы */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Товары ({totalItems})</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Скидка</span>
              <span className="font-medium text-green-600">
                -{formatPrice(discount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Доставка</span>
            <span className="font-medium">
              {isFreeShipping ? 'Бесплатно' : formatPrice(shipping)}
            </span>
          </div>
        </div>

        {/* Прогресс бесплатной доставки */}
        {!isFreeShipping && remainingForFreeShipping > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                До бесплатной доставки
              </span>
              <span className="text-sm font-bold text-blue-800">
                {formatPrice(remainingForFreeShipping)}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Добавьте товаров на {formatPrice(remainingForFreeShipping)} для бесплатной доставки
            </p>
          </div>
        )}

        {/* Итоговая сумма */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">К оплате</span>
            <span className="text-2xl font-bold">{formatPrice(total)}</span>
          </div>
          <p className="text-sm text-gray-500">
            Включая НДС и сборы
          </p>
        </div>

        {/* Кнопка оформления */}
        <Button
          onClick={onCheckout}
          loading={isLoading}
          disabled={isLoading || totalItems === 0}
          className="w-full mt-6 py-3 text-lg"
        >
          Перейти к оформлению
        </Button>

        {/* Альтернативные способы оплаты */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">Принимаем к оплате:</p>
          <div className="flex items-center gap-2">
            {['visa', 'mastercard', 'mir', 'sbp'].map((method) => (
              <div
                key={method}
                className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center"
              >
                <div className="text-xs font-medium text-gray-500">
                  {method === 'sbp' ? 'СБП' : method.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Гарантии */}
        <div className="pt-4 border-t">
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Гарантия возврата 14 дней</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Официальная гарантия</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Безопасная оплата</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}