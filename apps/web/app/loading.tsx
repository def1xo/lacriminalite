import { Loader2, ShoppingBag, Package, Truck, CreditCard } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Затемнение фона */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Основной лоадер */}
        <div className="relative z-10">
          <div className="text-center">
            {/* Анимированный логотип */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto relative">
                {/* Вращающийся круг */}
                <div className="absolute inset-0 border-4 border-black/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-black rounded-full animate-spin"></div>
                
                {/* Иконка */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Текст */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                La Criminalite
              </h2>
              <p className="text-gray-600">
                Загрузка данных...
              </p>
            </div>

            {/* Прогресс-бар */}
            <div className="w-64 mx-auto mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full animate-loading-bar"></div>
              </div>
            </div>

            {/* Индикаторы загрузки */}
            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 animate-pulse">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-xs text-gray-500">Товары</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 animate-pulse delay-75">
                  <Truck className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-xs text-gray-500">Доставка</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 animate-pulse delay-150">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-xs text-gray-500">Оплата</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 animate-pulse delay-300">
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                </div>
                <div className="text-xs text-gray-500">Подготовка</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Стили для анимаций */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Компонент скелетона для контента
export function ContentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Компонент скелетона для карточки товара
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент скелетона для списка товаров
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Компонент скелетона для шапки
export function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="hidden md:flex items-center gap-6">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}