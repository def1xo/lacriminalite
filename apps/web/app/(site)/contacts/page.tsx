import { MapPin, Phone, Mail, Clock, Instagram, Telegram, Globe, Send } from 'lucide-react';
import ContactForm from '@/components/contacts/ContactForm';

const contactInfo = [
  {
    icon: Phone,
    title: 'Телефон',
    value: '+7 (999) 999-99-99',
    description: 'Ежедневно с 10:00 до 20:00',
    link: 'tel:+79999999999',
  },
  {
    icon: Mail,
    title: 'Почта',
    value: 'info@lacriminalite.ru',
    description: 'Отвечаем в течение 24 часов',
    link: 'mailto:info@lacriminalite.ru',
  },
  {
    icon: MapPin,
    title: 'Шоурум',
    value: 'Москва, ул. Примерная, 123',
    description: 'Пн-Сб: 11:00-20:00, Вс: 12:00-18:00',
    link: 'https://yandex.ru/maps/-/CDVnNI~r',
  },
  {
    icon: Clock,
    title: 'Время работы',
    value: '10:00 - 20:00',
    description: 'Без выходных',
    link: null,
  },
];

const socialLinks = [
  {
    platform: 'Instagram',
    icon: Instagram,
    handle: '@lacriminalite',
    url: 'https://instagram.com/lacriminalite',
    followers: '150K+',
  },
  {
    platform: 'Telegram',
    icon: Telegram,
    handle: 'La Criminalite',
    url: 'https://t.me/lacriminalite',
    followers: '25K+',
  },
  {
    platform: 'Сайт',
    icon: Globe,
    handle: 'lacriminalite.ru',
    url: 'https://lacriminalite.ru',
    followers: null,
  },
];

const faqQuestions = [
  {
    question: 'Как добраться до шоурума?',
    answer: 'Шоурум находится в центре Москвы, 5 минут пешком от метро "Примерная". Есть парковка для клиентов.',
  },
  {
    question: 'Можно ли примерить одежду в шоуруме?',
    answer: 'Да, у нас есть примерочные. Рекомендуем записаться заранее в часы пик (сб-вс).',
  },
  {
    question: 'Есть ли у вас коллаборации с другими брендами?',
    answer: 'Да, мы регулярно выпускаем коллаборации. Следите за анонсами в соцсетях.',
  },
  {
    question: 'Как стать дилером вашего бренда?',
    answer: 'Пишите на dealer@lacriminalite.ru с информацией о вашем магазине или площадке.',
  },
];

export default function ContactsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero секция */}
      <section className="relative py-20 bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Контакты</h1>
            <p className="text-xl text-gray-300">
              Свяжитесь с нами любым удобным способом. Мы всегда на связи.
            </p>
          </div>
        </div>
      </section>

      {/* Контактная информация */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((contact) => (
              <div 
                key={contact.title}
                className="border rounded-2xl p-6 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-4">
                  <contact.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{contact.title}</h3>
                {contact.link ? (
                  <a 
                    href={contact.link} 
                    className="text-red-600 hover:underline font-medium block mb-1"
                  >
                    {contact.value}
                  </a>
                ) : (
                  <p className="text-gray-900 font-medium mb-1">{contact.value}</p>
                )}
                <p className="text-gray-600 text-sm">{contact.description}</p>
              </div>
            ))}
          </div>

          {/* Карта и форма */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Карта */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Наш шоурум</h2>
              <div className="rounded-2xl overflow-hidden border h-96 bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="font-semibold">Москва, ул. Примерная, 123</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Интерактивная карта будет здесь
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-medium">Часы работы:</span>
                    <span className="ml-2 text-gray-600">Пн-Сб: 11:00-20:00, Вс: 12:00-18:00</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-medium">Телефон шоурума:</span>
                    <a href="tel:+79999999999" className="ml-2 text-red-600 hover:underline">
                      +7 (999) 999-99-99
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Форма обратной связи */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Напишите нам</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Социальные сети */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Мы в соцсетях</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <social.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{social.platform}</h3>
                    {social.followers && (
                      <p className="text-sm text-gray-600">{social.followers} подписчиков</p>
                    )}
                  </div>
                </div>
                <p className="text-gray-900 font-medium">{social.handle}</p>
                <div className="mt-4 flex items-center gap-2 text-red-600">
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Перейти</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Частые вопросы</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqQuestions.map((faq, idx) => (
              <div key={idx} className="border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Команда поддержки */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Команда поддержки</h2>
            <p className="text-gray-300 mb-8">
              Наша команда всегда готова помочь с выбором товара, оформлением заказа или решением любых вопросов.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Мария</h3>
                <p className="text-gray-300 mb-4">Менеджер по продажам</p>
                <a 
                  href="mailto:maria@lacriminalite.ru" 
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  maria@lacriminalite.ru
                </a>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Александр</h3>
                <p className="text-gray-300 mb-4">Служба доставки</p>
                <a 
                  href="mailto:delivery@lacriminalite.ru" 
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  delivery@lacriminalite.ru
                </a>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Екатерина</h3>
                <p className="text-gray-300 mb-4">Возвраты и обмены</p>
                <a 
                  href="mailto:returns@lacriminalite.ru" 
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  returns@lacriminalite.ru
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Остались вопросы?</h2>
            <p className="text-gray-600 mb-8">
              Не нашли ответ на свой вопрос? Напишите нам напрямую, мы ответим в течение часа.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:help@lacriminalite.ru"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Написать на почту
              </a>
              <a
                href="https://t.me/lacriminalite_help"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors"
              >
                <Telegram className="w-4 h-4" />
                Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}