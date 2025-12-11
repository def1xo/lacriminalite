'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  ShoppingBag, 
  Search, 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Логирование ошибки 404
    console.warn('404 Page Not Found:', window.location.pathname);
    
    // Отправка в аналитику
    if (typeof window !== 'undefined' && (window as any).ym) {
      (window as any).ym(00000000, 'reachGoal', '404_error', {
        url: window.location.pathname
      });
    }
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-bold mb-4">
                ОШИБКА 404
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Страница не найдена
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Запрашиваемая страница не существует или была перемещена.
              Проверьте адрес или воспользуйтесь навигацией ниже.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">На главную</h3>
              <p className="text-sm text-gray-600 mb-4">
                Вернуться на главную страницу
              </p>
              <Link href="/">
                <Button className="w-full">Перейти</Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">В каталог</h3>
              <p className="text-sm text-gray-600 mb-4">
                Посмотреть все товары
              </p>
              <Link href="/catalog">
                <Button className="w-full">Смотреть</Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <ArrowLeft className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Назад</h3>
              <p className="text-sm text-gray-600 mb-4">
                Вернуться на предыдущую страницу
              </p>
              <Button onClick={handleGoBack} className="w-full">Назад</Button>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Поиск</h3>
              <p className="text-sm text-gray-600 mb-4">
                Найдите нужный товар
              </p>
              <Link href="/catalog">
                <Button variant="outline" className="w-full">Искать</Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-8 mb-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Не нашли то, что искали?</h2>
              <p className="text-gray-300 mb-6">
                Свяжитесь с нашей поддержкой, и мы поможем найти нужный товар
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@lacriminalite.ru"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ✉️ Написать на почту
                </a>
                <a
                  href="https://t.me/lacriminalite_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-black transition-colors"
                >
                  💬 Написать в Telegram
                </a>
              </div>
            </div>
          </div>

          {/* Популярные страницы */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Популярные разделы</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: 'LIMITED Коллекция', href: '/catalog/limited' },
                { name: 'REGULAR Коллекция', href: '/catalog/regular' },
                { name: 'Новинки', href: '/catalog?sort=newest' },
                { name: 'Распродажа', href: '/catalog?sale=true' },
                { name: 'Худи', href: '/catalog?category=hoodie' },
                { name: 'Футболки', href: '/catalog?category=tshirt' },
                { name: 'Доставка', href: '/delivery' },
                { name: 'Возврат', href: '/returns' },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Техническая информация */}
          <div className="bg-gray-50 rounded-xl p-6 border">
            <h3 className="font-semibold mb-3">Техническая информация</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Если вы уверены, что страница должна существовать, попробуйте:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Очистить кэш браузера (Ctrl + Shift + R)</li>
                <li>Проверить правильность написания адреса</li>
                <li>Использовать поиск по сайту</li>
                <li>Перезагрузить страницу</li>
              </ul>
              <p className="mt-4">
                Если проблема повторяется, сообщите нам об этом по адресу{' '}
                <a href="mailto:dev@lacriminalite.ru" className="text-black hover:underline">
                  dev@lacriminalite.ru
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}