import { RefreshCw, Package, Clock, Shield, AlertCircle, Mail } from 'lucide-react';

const returnReasons = [
  {
    id: 'size',
    reason: 'Не подошел размер',
    description: 'Можно обменять на другой размер или вернуть',
    timeframe: '14 дней',
    condition: 'Товар не был в употреблении, бирки сохранены',
  },
  {
    id: 'defect',
    reason: 'Бракованный товар',
    description: 'Обмен или возврат за наш счет',
    timeframe: 'В течение гарантийного срока',
    condition: 'Фабричный брак, повреждения при доставке',
  },
  {
    id: 'color',
    reason: 'Не понравился цвет или модель',
    description: 'Возврат или обмен на другую модель',
    timeframe: '14 дней',
    condition: 'Товар не был в употреблении, все ярлыки сохранены',
  },
];

const returnSteps = [
  {
    step: 1,
    title: 'Оформление заявки',
    description: 'Заполните форму возврата в личном кабинете или напишите нам',
  },
  {
    step: 2,
    title: 'Подтверждение',
    description: 'Мы проверим заявку и свяжемся с вами в течение 24 часов',
  },
  {
    step: 3,
    title: 'Отправка товара',
    description: 'Отправьте товар нам курьерской службой или в пункт выдачи',
  },
  {
    step: 4,
    title: 'Получение средств',
    description: 'После проверки товара мы вернем деньги в течение 10 рабочих дней',
  },
];

const nonReturnableItems = [
  'Нижнее белье и носки',
  'Товары с измененной конструкцией',
  'Вещи с повреждениями от носки',
  'Товары без бирок и упаковки',
  'Аксессуары со следами использования',
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero секция */}
      <section className="relative py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">Обмен и возврат</h1>
            </div>
            <p className="text-xl text-gray-300">
              Простая и понятная процедура возврата и обмена товаров
            </p>
          </div>
        </div>
      </section>

      {/* Основная информация */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Гарантия качества</h3>
                  <p className="text-gray-700">
                    Мы гарантируем качество всех товаров. Если вам что-то не подошло или вы обнаружили брак, 
                    мы без проблем примем товар обратно в течение 14 дней с момента получения.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-8">Условия возврата</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {returnReasons.map((item) => (
                <div key={item.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-3">{item.reason}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Срок: {item.timeframe}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item.condition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Процесс возврата */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как оформить возврат</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {returnSteps.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto">
                      {step.step}
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Что нельзя вернуть */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Товары, которые нельзя вернуть</h3>
                  <p className="text-gray-700 mb-4">
                    Согласно Постановлению Правительства РФ №55 от 19.01.1998, некоторые товары надлежащего качества не подлежат возврату.
                  </p>
                  <ul className="space-y-2">
                    {nonReturnableItems.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Возврат денежных средств */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Возврат денежных средств</h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border">
              <h3 className="text-2xl font-bold mb-4">Сроки возврата</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-gray-600">Оплата картой</span>
                  <span className="font-semibold">до 10 рабочих дней</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-gray-600">Оплата через СБП</span>
                  <span className="font-semibold">до 3 рабочих дней</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Наличная оплата</span>
                  <span className="font-semibold">до 14 рабочих дней</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border">
              <h3 className="text-2xl font-bold mb-4">Как мы возвращаем</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    💳
                  </div>
                  <div>
                    <div className="font-semibold">На карту</div>
                    <div className="text-sm text-gray-600">По тому же платежному средству</div>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    🏦
                  </div>
                  <div>
                    <div className="font-semibold">На расчетный счет</div>
                    <div className="text-sm text-gray-600">Для юридических лиц</div>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                    💰
                  </div>
                  <div>
                    <div className="font-semibold">Наличными</div>
                    <div className="text-sm text-gray-600">При возврате в шоуруме</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ и контакты */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Частые вопросы</h3>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-2">Сколько стоит возврат?</h4>
                  <p className="text-gray-600 text-sm">
                    Если товар надлежащего качества - стоимость доставки оплачиваете вы. 
                    При обнаружении брака - все расходы за наш счет.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-2">Что нужно для возврата?</h4>
                  <p className="text-gray-600 text-sm">
                    Паспорт, заявление на возврат, товар в оригинальной упаковке с бирками, чек или QR-код.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-2">Можно ли вернуть товар в шоуруме?</h4>
                  <p className="text-gray-600 text-sm">
                    Да, принесите товар с документами в наш шоурум в Москве. Возврат наличными за 15 минут.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">Нужна помощь?</h3>
              
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-semibold">Почта для возвратов</div>
                    <a href="mailto:returns@lacriminalite.ru" className="text-red-600 hover:underline">
                      returns@lacriminalite.ru
                    </a>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Укажите в письме номер заказа, причину возврата и прикрепите фото товара.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-sm font-semibold mb-2">Быстрый возврат через ЛК</div>
                    <p className="text-xs text-gray-600">
                      Зайдите в личный кабинет → Мои заказы → Выберите заказ → Оформить возврат
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm text-gray-500">
                    Обычно мы отвечаем в течение 24 часов в рабочее время (Пн-Пт 10:00-19:00).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}