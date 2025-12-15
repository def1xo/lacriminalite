import { prisma } from '@/lib/prisma';
import Image from 'next/image';


export default async function AboutPage() {
const page = await prisma.staticPage.findUnique({ where: { slug: 'about' } });
const content = page?.content ?? `
<h2>La Criminalité — это не для всех</h2>
<p>La Criminalité — это для тех, кто готов бросить вызов обществу, кто видит красоту в несовершенстве и кто ценит ограниченность и эксклюзивность. Бренд не рекламирует себя через массовые каналы, он распространяется через сарафанное радио, underground-ивенты и коллаборации с локальными художниками.</p>
<p>Это не просто мода, это образ жизни. Бренд отражает дух улиц, где каждая деталь имеет значение. Каждая коллекция — это история, рассказанная через призму урбанистической эстетики.</p>
`;


return (
<main className="container mx-auto px-4 py-12">
<section className="max-w-3xl mx-auto prose">
<Image src="/media/telegram.gif" alt="gif" width={800} height={300} />
<div dangerouslySetInnerHTML={{ __html: content }} />
</section>
</main>
);
}