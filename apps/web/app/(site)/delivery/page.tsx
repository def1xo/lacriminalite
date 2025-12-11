import { Truck, Package, Store, Clock, Shield, MapPin } from 'lucide-react';
import Image from 'next/image';

const deliveryMethods = [
  {
    id: 'sdek',
    name: 'СДЭК',
    icon: Truck,
    description: 'Доставка курьером или в пункт выдачи',
    price: 'от 300 ₽',
    time: '1-5 дней',
    features: ['Трекинг заказа', 'Страхование', 'Примерка'],
    note: 'Стоимость рассчитывается при оформлении заказа',
  },
  {
    id: 'yandex',
    name: 'Яндекс Доставка',
    icon: Package,
    description: 'Экспресс доставка по крупным городам',
    price: 'от 450 ₽',
    time: '1-2 дня',
    features: ['Доставка за 90 минут', 'Трекинг в реальном времени', 'СМС-уведомления'],
    note: 'Доступно в Москве, СПб и других крупных городах',
  },
  {
    id: 'pickup',
    name: 'Самовывоз',
    icon: Store,
    description: 'Заберите заказ из нашего шоурума',
    price: 'Бесплатно',
    time: '1-3 дня',
    features: ['Бесплатно', 'Примерка на месте', 'Консультация', 'Мгновенное получение'],
    note: 'Предварительная запись не требуется',
  },
];

const cities = [
  { name: 'Москва', delivery: '1-2 дня' },
  { name: 'Санкт-Петербург', delivery: '1-3 дня' },
  { name: 'Новосибирск', delivery: '3-5 дней' },
  { name: 'Екатеринбург', delivery: '2-4 дня' },
  { name: 'Казань', delivery: '2-4 дня' },
  { name: 'Нижний Новгород', delivery: '2-4 дня' },
  { name: 'Краснодар', delivery: '3-6 дней' },
  { name: 'Владивосток', delivery: '5-10 дней' },
];

export default function DeliveryPage() {
  return (
    <div className="min-h-screen">
      {/* Hero секция */}
      <section className="relative py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Доставка и оплата</h1>
            <p className="text-xl text-gray-300">
              Быстрая и надежная доставка по всей России. Оплата любым удобным способом.
            </p>
          </div>
        </div>
      </section>

      {/* Способы доставки */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Способы доставки</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {deliveryMethods.map((method) => (
              <div 
                key={method.id}
                className="border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{method.name}</h3>
                    <p className="text-gray-600">{method.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-gray-600">Стоимость</span>
                    <span className="font-bold text-lg">{method.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-gray-600">Срок доставки</span>
                    <span className="font-bold text-lg">{method.time}</span>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-semibold mb-2">Особенности:</h4>
                    <ul className="space-y-2">
                      {method.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">{method.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Карта доставки по городам */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Сроки доставки по городам</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city) => (
              <div 
                key={city.name}
                className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold">{city.name}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Срок доставки</span>
                  <span className="font-bold">{city.delivery}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Не нашли свой город? Свяжитесь с нами для уточнения сроков доставки
            </p>
            <a 
              href="mailto:delivery@lacriminalite.ru" 
              className="inline-block mt-4 text-red-600 font-semibold hover:underline"
            >
              delivery@lacriminalite.ru
            </a>
          </div>
        </div>
      </section>

      {/* Процесс доставки */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как происходит доставка</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Оформление заказа</h3>
              <p className="text-gray-600 text-sm">
                Выберите товар, укажите адрес и способ доставки
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Подтверждение</h3>
              <p className="text-gray-600 text-sm">
                Мы проверяем наличие и связываемся для подтверждения
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Отправка</h3>
              <p className="text-gray-600 text-sm">
                Формируем и отправляем заказ с трек-номером
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Получение</h3>
              <p className="text-gray-600 text-sm">
                Получаете заказ в пункте выдачи или от курьера
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Частые вопросы</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold text-lg mb-2">
                Как отследить заказ?
              </h3>
              <p className="text-gray-600">
                После отправки заказа мы присылаем трек-номер на вашу почту. 
                Вы можете отслеживать заказ в личном кабинете или на сайте службы доставки.
              </p>
            </div>
            
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold text-lg mb-2">
                Можно ли изменить адрес доставки?
              </h3>
              <p className="text-gray-600">
                Да, вы можете изменить адрес доставки до момента отправки заказа. 
                Свяжитесь с нами по почте или через Telegram.
              </p>
            </div>
            
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold text-lg mb-2">
                Что делать, если товар поврежден?
              </h3>
              <p className="text-gray-600">
                Сохраните товар в том виде, в котором он был получен, и немедленно свяжитесь с нами. 
                Мы организуем возврат или замену за наш счет.
              </p>
            </div>
            
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold text-lg mb-2">
                Доставляете ли вы в другие страны?
              </h3>
              <p className="text-gray-600">
                Да, мы осуществляем международную доставку. 
                Стоимость и сроки рассчитываются индивидуально для каждой страны.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}