import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

function formatDate(dt?: Date | string | null) {
  if (!dt) return '';
  try {
    const d = new Date(dt);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dt);
  }
}

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      price: true,
      images: true,
      slug: true
    }
  });

  return (
    <main className="noise-wrapper min-h-screen bg-white">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <a href="/login" aria-label="Перейти к авторизации">
            <Image
              src="/media/telegram.gif"
              alt="Перейти в Telegram / авторизация"
              width={900}
              height={260}
              className="hero-gif mx-auto rounded-md shadow-md"
              priority
            />
          </a>
        </div>

        <div className="max-w-4xl mx-auto prose">
          <h2>События</h2>
          <p>
            Мы регулярно проводим мероприятия: презентации коллекций, коллаборации, pop-up магазины и закрытые показы.
            Все текущие и предстоящие ивенты публикуются здесь — скачать билет или забронировать участие можно на странице
            конкретного мероприятия.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-10">
          {events.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="text-2xl font-semibold mb-4">Скоро</h3>
              <p className="text-gray-600 max-w-xl mx-auto">
                Сейчас ивентов нет, но мы уже работаем над новыми проектами. Подпишитесь на наш Telegram, чтобы не
                пропустить анонсы.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((e) => {
                let imageSrc = '/placeholders/event.jpg';
                if (e.images) {
                  try {
                    if (Array.isArray(e.images) && e.images.length) imageSrc = String(e.images[0]);
                    else if (typeof e.images === 'string' && e.images) imageSrc = e.images;
                    else if ((e.images as any)?.url) imageSrc = (e.images as any).url;
                  } catch {
                    imageSrc = '/placeholders/event.jpg';
                  }
                }
                return (
                  <article key={e.id} className="border rounded-lg overflow-hidden shadow-sm">
                    <Link href={`/events/${e.slug ?? e.id}`} className="block">
                      <div className="relative w-full h-56 md:h-44">
                        <Image
                          src={imageSrc}
                          alt={e.title || 'Мероприятие'}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">
                        <Link href={`/events/${e.slug ?? e.id}`}>{e.title}</Link>
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{formatDate(e.startsAt)}</p>
                      <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                        {e.description ?? ''}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-800 font-medium">
                          {typeof e.price === 'number' && e.price > 0 ? `${e.price} ₽` : 'Бесплатно'}
                        </div>
                        <Link
                          href={`/events/${e.slug ?? e.id}`}
                          className="text-sm bg-black text-white px-3 py-1 rounded-md"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
