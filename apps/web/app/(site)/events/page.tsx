import { Calendar, MapPin, Clock, Filter } from 'lucide-react';
import EventCard from '@/components/events/EventCard/EventCard';
import { getAllEvents } from '@/lib/api/events';

export default async function EventsPage() {
  const events = await getAllEvents();
  
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());
  const pastEvents = events.filter(e => new Date(e.date) <= new Date());

  return (
    <div className="min-h-screen">
      {/* Hero секция */}
      <section className="relative py-20 bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">События</h1>
            <p className="text-xl text-gray-300">
              Присоединяйтесь к нашим мероприятиям, презентациям и эксклюзивным релизам
            </p>
          </div>
        </div>
      </section>

      {/* Фильтры */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg">
                <Filter className="w-4 h-4" />
                Все события
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Calendar className="w-4 h-4" />
                Предстоящие
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Clock className="w-4 h-4" />
                Прошедшие
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              {upcomingEvents.length} предстоящих события
            </div>
          </div>
        </div>
      </section>

      {/* Предстоящие события */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Предстоящие события</h2>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} featured />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет предстоящих событий</h3>
              <p className="text-gray-600">Следите за обновлениями, мы скоро анонсируем новые мероприятия</p>
            </div>
          )}
        </div>
      </section>

      {/* Прошедшие события */}
      {pastEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Прошедшие события</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} past />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA секция */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Хотите организовать совместное мероприятие?</h2>
            <p className="text-gray-600 mb-8">
              Мы открыты к сотрудничеству с магазинами, площадками и брендами
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:events@lacriminalite.ru"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Предложить площадку
              </a>
              <a
                href="mailto:collab@lacriminalite.ru"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Предложить коллаборацию
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}