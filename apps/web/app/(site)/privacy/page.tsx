export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero секция */}
      <section className="relative py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Политика конфиденциальности</h1>
            <p className="text-xl text-gray-300">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Содержание */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Содержание</h2>
                <ul className="space-y-2 text-blue-600">
                  <li><a href="#general" className="hover:underline">1. Общие положения</a></li>
                  <li><a href="#data-collection" className="hover:underline">2. Какие данные мы собираем</a></li>
                  <li><a href="#data-usage" className="hover:underline">3. Как мы используем ваши данные</a></li>
                  <li><a href="#data-protection" className="hover:underline">4. Защита данных</a></li>
                  <li><a href="#data-sharing" className="hover:underline">5. Передача данных третьим лицам</a></li>
                  <li><a href="#cookies" className="hover:underline">6. Использование файлов cookie</a></li>
                  <li><a href="#rights" className="hover:underline">7. Ваши права</a></li>
                  <li><a href="#contacts" className="hover:underline">8. Контакты</a></li>
                </ul>
              </div>

              <div id="general" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">1. Общие положения</h2>
                <p className="mb-4">
                  Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки 
                  и защиты информации о пользователях (далее — «Пользователи»), которую может получить 
                  интернет-магазин «La Criminalite» (далее — «Магазин») при использовании Пользователем 
                  сайта https://lacriminalite.ru (далее — «Сайт»).
                </p>
                <p>
                  Используя Сайт, Пользователь выражает свое полное согласие с условиями настоящей Политики. 
                  Если Пользователь не согласен с условиями Политики, он должен прекратить использование Сайта.
                </p>
              </div>

              <div id="data-collection" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">2. Какие данные мы собираем</h2>
                <p className="mb-4">Мы можем собирать следующие данные:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Личные данные:</strong> имя, фамилия, отчество, адрес электронной почты, 
                    номер телефона, адрес доставки.
                  </li>
                  <li>
                    <strong>Данные для заказа:</strong> информация о выбранных товарах, размерах, 
                    способах доставки и оплаты.
                  </li>
                  <li>
                    <strong>Технические данные:</strong> IP-адрес, данные о браузере и устройстве, 
                    данные о посещенных страницах, время и дата посещения.
                  </li>
                  <li>
                    <strong>Данные платежей:</strong> реквизиты карты обрабатываются платежным сервисом ЮKassa, 
                    мы не храним данные карт.
                  </li>
                </ul>
              </div>

              <div id="data-usage" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">3. Как мы используем ваши данные</h2>
                <p className="mb-4">Мы используем ваши данные для следующих целей:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Обработки и выполнения ваших заказов</li>
                  <li>Обеспечения работы Сайта и его функциональности</li>
                  <li>Коммуникации с вами по вопросам заказов и обслуживания</li>
                  <li>Отправки маркетинговых материалов (только с вашего согласия)</li>
                  <li>Улучшения качества наших товаров и услуг</li>
                  <li>Защиты от мошеннических действий</li>
                  <li>Выполнения требований законодательства</li>
                </ul>
              </div>

              <div id="data-protection" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">4. Защита данных</h2>
                <p className="mb-4">
                  Мы принимаем необходимые организационные и технические меры для защиты ваших персональных данных 
                  от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, 
                  распространения, а также от иных неправомерных действий.
                </p>
                <p className="mb-4">
                  Для защиты данных мы используем:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Шифрование данных при передаче (SSL/TLS)</li>
                  <li>Регулярное обновление систем безопасности</li>
                  <li>Ограничение доступа к данным только для уполномоченных сотрудников</li>
                  <li>Регулярное резервное копирование данных</li>
                  <li>Мониторинг и предотвращение атак</li>
                </ul>
              </div>

              <div id="data-sharing" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">5. Передача данных третьим лицам</h2>
                <p className="mb-4">
                  Мы можем передавать ваши данные следующим третьим лицам только в объеме, необходимом 
                  для выполнения наших обязательств:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Службы доставки</strong> (СДЭК, Яндекс Доставка) — для доставки ваших заказов
                  </li>
                  <li>
                    <strong>Платежные системы</strong> (ЮKassa) — для обработки платежей
                  </li>
                  <li>
                    <strong>Хостинг-провайдеры</strong> — для хранения данных
                  </li>
                  <li>
                    <strong>Сервисы аналитики</strong> (Яндекс.Метрика, Google Analytics) — для анализа посещаемости
                  </li>
                  <li>
                    <strong>Государственные органы</strong> — при наличии законного требования
                  </li>
                </ul>
                <p>
                  Все третьи лица обязаны соблюдать конфиденциальность и обеспечивать защиту 
                  передаваемых им данных.
                </p>
              </div>

              <div id="cookies" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">6. Использование файлов cookie</h2>
                <p className="mb-4">
                  Сайт использует файлы cookie и аналогичные технологии для улучшения работы Сайта, 
                  анализа трафика и персонализации контента.
                </p>
                <p className="mb-4">
                  Типы используемых cookie:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Необходимые:</strong> обеспечивают работу основных функций Сайта
                  </li>
                  <li>
                    <strong>Функциональные:</strong> запоминают ваши настройки и предпочтения
                  </li>
                  <li>
                    <strong>Аналитические:</strong> помогают анализировать использование Сайта
                  </li>
                  <li>
                    <strong>Маркетинговые:</strong> используются для показа релевантной рекламы
                  </li>
                </ul>
                <p>
                  Вы можете отключить использование cookie в настройках вашего браузера, 
                  однако это может повлиять на работу некоторых функций Сайта.
                </p>
              </div>

              <div id="rights" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">7. Ваши права</h2>
                <p className="mb-4">В соответствии с законодательством РФ, вы имеете право:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>На доступ к своим персональным данным</li>
                  <li>На уточнение (обновление, изменение) своих данных</li>
                  <li>На блокирование или уничтожение данных</li>
                  <li>На отзыв согласия на обработку данных</li>
                  <li>На обжалование действий или бездействия оператора</li>
                </ul>
                <p>
                  Для реализации своих прав вы можете обратиться к нам по адресу электронной почты: 
                  <a href="mailto:privacy@lacriminalite.ru" className="text-red-600 hover:underline ml-1">
                    privacy@lacriminalite.ru
                  </a>
                </p>
              </div>

              <div id="contacts" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">8. Контакты</h2>
                <p className="mb-4">
                  По всем вопросам, связанным с обработкой ваших персональных данных и настоящей Политикой, 
                  вы можете обращаться:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="mb-2"><strong>Электронная почта:</strong> 
                    <a href="mailto:privacy@lacriminalite.ru" className="text-red-600 hover:underline ml-2">
                      privacy@lacriminalite.ru
                    </a>
                  </p>
                  <p className="mb-2"><strong>Почтовый адрес:</strong> 
                    <span className="ml-2">123456, Россия, г. Москва, ул. Примерная, д. 123</span>
                  </p>
                  <p><strong>Телефон:</strong> 
                    <a href="tel:+79999999999" className="text-red-600 hover:underline ml-2">
                      +7 (999) 999-99-99
                    </a>
                  </p>
                </div>
              </div>

              <div className="border-t pt-8 mt-8">
                <p className="text-gray-600 text-sm">
                  Настоящая Политика может изменяться. Мы будем размещать обновленную версию на этой странице 
                  с указанием даты последнего обновления.
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Продолжая использование Сайта после внесения изменений, вы подтверждаете свое согласие 
                  с обновленной Политикой.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA для согласия */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Согласие на обработку данных</h2>
            <p className="text-gray-600 mb-8">
              Регистрируясь на Сайте или оформляя заказ, вы подтверждаете свое согласие 
              с условиями настоящей Политики конфиденциальности.
            </p>
            <div className="bg-white rounded-lg p-6 border">
              <p className="text-sm text-gray-600">
                <strong>Важно:</strong> Обработка ваших персональных данных осуществляется в соответствии 
                с Федеральным законом №152-ФЗ «О персональных данных» и настоящей Политикой.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}