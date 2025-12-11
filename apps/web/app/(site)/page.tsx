import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Truck, CreditCard, RefreshCw } from 'lucide-react';
import Hero from '@/components/marketing/Hero/Hero';
import ProductCard from '@/components/catalog/ProductCard/ProductCard';
import EventCard from '@/components/events/EventCard/EventCard';
import Banner from '@/components/marketing/Banner/Banner';
import Newsletter from '@/components/marketing/Newsletter/Newsletter';
import { getFeaturedProducts } from '@/lib/api/products';
import { getUpcomingEvents } from '@/lib/api/events';

export default async function HomePage() {
  const [featuredProducts, upcomingEvents] = await Promise.all([
    getFeaturedProducts(),
    getUpcomingEvents()
  ]);

  return (
    <>
      {/* Hero секция */}
      <Hero />

      {/* LIMITED коллекция */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                LIMITED <span className="text-red-600">Коллекция</span>
              </h2>
              <p className="text-gray-600">Эксклюзивные модели ограниченным тиражом</p>
            </div>
            <Link 
              href="/catalog/limited" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Смотреть все
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts
              .filter(p => p.collection === 'LIMITED')
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      </section>

      {/* REGULAR коллекция */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                REGULAR <span className="text-gray-700">Коллекция</span>
              </h2>
              <p className="text-gray-600">Базовые модели всегда в наличии</p>
            </div>
            <Link 
              href="/catalog/regular" 
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              Смотреть все
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts
              .filter(p => p.collection === 'REGULAR')
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-full mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">
                Доставка по России от 1 дня через СДЭК, Яндекс Доставку и другие службы
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-full mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Безопасная оплата</h3>
              <p className="text-gray-600">
                Оплата картой, через ЮMoney, СБП и другие способы. Защищено ЮKassa
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Легкий возврат</h3>
              <p className="text-gray-600">
                Возврат и обмен в течение 14 дней. Простая процедура
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Предстоящие события */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Ближайшие <span className="text-red-600">События</span>
              </h2>
              <p className="text-gray-600">Встречи, презентации и эксклюзивные релизы</p>
            </div>
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Все события
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Система лояльности */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Программа лояльности</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Получайте <span className="text-red-500">скидки</span> за покупки
              </h2>
              <p className="text-gray-300 mb-6">
                За каждую покупку получайте бонусы и повышайте свой уровень. 
                Максимальная скидка - 15% на все будущие заказы.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-sm font-bold">5%</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Уровень 1 - Бронза</h4>
                    <p className="text-sm text-gray-300">От 25,000 ₽ покупок</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-bold text-black">10%</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Уровень 2 - Серебро</h4>
                    <p className="text-sm text-gray-300">От 50,000 ₽ покупок</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-sm font-bold">15%</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Уровень 3 - Золото</h4>
                    <p className="text-sm text-gray-300">От 100,000 ₽ покупок</p>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/profile/loyalty" 
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Узнать больше
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <Image
                  src="/images/loyalty-hero.jpg"
                  alt="Система лояльности La Criminalite"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Баннер с акцией */}
      <Banner
        title="Скидка 10% на первую покупку"
        description="Зарегистрируйтесь и получите промокод на первую покупку"
        ctaText="Зарегистрироваться"
        ctaLink="/auth/register"
        theme="gradient"
      />

      {/* Рассылка */}
      <Newsletter />

      {/* Инстаграм фид (заглушка) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Мы в Instagram</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}