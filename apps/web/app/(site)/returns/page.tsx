import { prisma } from '@/lib/prisma';


export default async function ReturnsPage() {
const page = await prisma.staticPage.findUnique({ where: { slug: 'returns' } });
const content = page?.content ?? `
<h2>Обмен и возврат</h2>
<p>У нас действует 30-дневная политика возврата: у вас есть 30 дней после получения товара, чтобы запросить возврат. Товар должен быть в оригинальном состоянии, с бирками и в упаковке. Для возврата понадобится чек или подтверждение покупки.</p>
`;


return (
<main className="container mx-auto px-4 py-12">
<section className="max-w-3xl mx-auto prose">
<div dangerouslySetInnerHTML={{ __html: content }} />
</section>
</main>
);
}