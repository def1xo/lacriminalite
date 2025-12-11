import { CreditCard, Smartphone, Wallet, Building, Shield, Lock } from 'lucide-react';

const paymentMethods = [
  {
    id: 'card',
    name: 'Банковские карты',
    icon: CreditCard,
    description: 'Visa, Mastercard, МИР',
    features: ['Безопасно', 'Мгновенное подтверждение', 'Защищено ЮKassa'],
    recommended: true,
  },
  {
    id: 'sbp',
    name: 'СБП (Система быстрых платежей)',
    icon: Smartphone,
    description: 'Через ваш банковский счет',
    features: ['Без комиссии', 'Мгновенная оплата', 'Поддержка всех банков'],
    recommended: true,
  },
  {
    id: 'yoomoney',
    name: 'ЮMoney',
    icon: Wallet,
    description: 'Бывшие Яндекс.Деньги',
    features: ['Кошелек ЮMoney', 'Банковская карта', 'Баланс телефона'],
  },
  {
    id: 'sb',
    name: 'Сбербанк',
    icon: Building,
    description: 'Онлайн-банк Сбер',
    features: ['СберБанк Онлайн', 'Pay', 'Со СберМегаМаркет'],
  },
  {
    id: 'tinkoff',
    name: 'Тинькофф',
    icon: Building,
    description: 'Банк Тинькофф',
    features: ['Тинькофф Банк', 'Рассрочка', 'Кредит'],
  },
];

const securityFeatures = [
  {
    title: 'PCI DSS сертификация',
    description: 'Стандарт безопасности для обработки платежных карт',
  },
  {
    title: '256-bit SSL шифрование',
    description: 'Защищенное соединение для всех транзакций',
  },
  {
    title: '3-D Secure',
    description: 'Двухфакторная аутентификация для карт',
  },
  {
    title: 'Антифрод система',
    description: 'Автоматический анализ подозрительных операций',
  },
];

export default function PaymentMethodsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero секция */}
      <section className="relative py-20 bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">Оплата</h1>
            </div>
            <p className="text-xl text-gray-300">
              Безопасная оплата любым удобным способом. Защищено ЮKassa.
            </p>
          </div>
        </div>
      </section>

      {/* Способы оплаты */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Способы оплаты</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <div 
                key={method.id}
                className={`border rounded-2xl p-6 ${method.recommended ? 'border-red-500 border-2' : 'hover:shadow-lg'} transition-shadow`}
              >
                {method.recommended && (
                  <div className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full mb-4">
                    Рекомендуем
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 ${method.recommended ? 'bg-red-500' : 'bg-black'} text-white rounded-lg flex items-center justify-center`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{method.name}</h3>
                    <p className="text-gray-600">{method.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {method.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Рассрочка и кредит */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Рассрочка и кредит</h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border">
              <h3 className="text-2xl font-bold mb-4">Рассрочка от Тинькофф</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span>Без первоначального взноса</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span>Срок до 12 месяцев</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span>Одобрение за 5 минут</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Предложение доступно для карт Тинькофф. При оформлении рассрочки вы получите уведомление в приложении Тинькофф.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border">
              <h3 className="text-2xl font-bold mb-4">Кредит от Совкомбанка</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span>Ставка от 5.9%</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span>Срок до 36 месяцев</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span>Решение онлайн</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Для оформления кредита потребуется паспорт и СНИЛС. Заявка рассматривается в течение 15 минут.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Безопасность платежей */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-12">
            <Lock className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold">Безопасность платежей</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, idx) => (
              <div key={idx} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Процесс оплаты */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как происходит оплата</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Линия */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 hidden md:block" />
              
              <div className="space-y-12">
                {[
                  {
                    step: 1,
                    title: 'Выбор способа оплаты',
                    description: 'На этапе оформления заказа выберите удобный способ оплаты из доступных',
                  },
                  {
                    step: 2,
                    title: 'Перенаправление на страницу оплаты',
                    description: 'После подтверждения заказа вы будете перенаправлены на защищенную страницу ЮKassa',
                  },
                  {
                    step: 3,
                    title: 'Ввод платежных данных',
                    description: 'Введите данные вашей карты или выберите другой способ оплаты',
                  },
                  {
                    step: 4,
                    title: 'Подтверждение оплаты',
                    description: 'После успешной оплаты вы вернетесь на сайт, а мы начнем собирать ваш заказ',
                  },
                ].map((item) => (
                  <div key={item.step} className="relative flex items-start gap-6">
                    <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                      {item.step}
                    </div>
                    <div className="pt-3">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Частые вопросы об оплате</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-2">
                Безопасно ли оплачивать картой на сайте?
              </h3>
              <p className="text-gray-600">
                Да, абсолютно безопасно. Мы используем защищенное соединение (SSL) и процессинговый центр ЮKassa, 
                который соответствует международному стандарту безопасности PCI DSS.
              </p>
            </div>
            
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-2">
                Что такое 3-D Secure?
              </h3>
              <p className="text-gray-600">
                Это дополнительная защита для онлайн-платежей. При оплате вас могут попросить 
                ввести код из СМС или подтвердить платеж в мобильном приложении банка.
              </p>
            </div>
            
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-2">
                Почему платеж не проходит?
              </h3>
              <p className="text-gray-600">
                Возможные причины: недостаточно средств на карте, превышен лимит на онлайн-платежи, 
                карта не поддерживает 3-D Secure, или банк заблокировал операцию. 
                Рекомендуем обратиться в ваш банк.
              </p>
            </div>
            
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-2">
                Как получить чек?
              </h3>
              <p className="text-gray-600">
                Электронный чек приходит на указанную при оформлении заказа почту сразу после оплаты. 
                Также чек можно скачать в личном кабинете в разделе "Мои заказы".
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}