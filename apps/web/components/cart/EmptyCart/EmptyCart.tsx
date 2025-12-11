import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

export default function EmptyCart() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Корзина пуста
            </h1>
            <p className="text-gray-600">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/catalog">
              <Button className="w-full">
                Перейти в каталог
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>

            <Link href="/catalog/limited">
              <Button variant="outline" className="w-full">
                Смотреть LIMITED коллекцию
              </Button>
            </Link>

            <Link href="/catalog/regular">
              <Button variant="outline" className="w-full">
                Смотреть REGULAR коллекцию
              </Button>
            </Link>
          </div>

          {/* Рекомендуемые товары (можно добавить позже) */}
          <div className="mt-12">
            <h3 className="font-semibold text-gray-900 mb-4">
              Возможно, вам понравится
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}