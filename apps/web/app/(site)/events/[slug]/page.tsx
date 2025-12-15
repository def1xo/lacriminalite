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

export default async function EventDetail({ params }: { params: { slug: string } }) {
  const slugParam = params.slug;
  let event = await prisma.event.findUnique({ where: { slug: slugParam } });
  if (!event) {
    const id = Number(slugParam);
    if (!Number.isNaN(id)) event = await prisma.event.findUnique({ where: { id } });
  }
  if (!event) {
    return (
      <main className="noise-wrapper min-h-screen bg-white">
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-semibold mb-4">Событие не найдено</h2>
          <p className="text-gray-600">Проверьте ссылку или вернитесь в список событий.</p>
          <div className="mt-6">
            <Link href="/events" className="px-4 py-2 bg-black text-white rounded">К списку событий</Link>
          </div>
        </section>
      </main>
    );
  }

  let imageSrc = '/placeholders/event.jpg';
  if (event.images) {
    try {
      if (Array.isArray(event.images) && event.images.length) imageSrc = String(event.images[0]);
      else if (typeof event.images === 'string' && event.images) imageSrc = event.images;
      else if ((event.images as any)?.url) imageSrc = (event.images as any).url;
    } catch {
      imageSrc = '/placeholders/event.jpg';
    }
  }

  return (
    <main className="noise-wrapper min-h-screen bg-white">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Image src={imageSrc} alt={event.title || 'Event'} width={1200} height={520} className="rounded-lg" style={{ objectFit: 'cover' }} />
          </div>
          <h1 className="text-3xl font-bold mb-3">{event.title}</h1>
          <div className="text-sm text-gray-500 mb-4">{formatDate(event.startsAt)}{event.endsAt ? ` — ${formatDate(event.endsAt)}` : ''}</div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: event.description || '' }} />
          <div className="mt-6 flex items-center justify-between">
            <div className="text-lg font-medium">{typeof event.price === 'number' && event.price > 0 ? `${event.price} ₽` : 'Бесплатно'}</div>
            <Link href="/events" className="text-sm bg-black text-white px-3 py-2 rounded">Вернуться</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
