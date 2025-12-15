import { prisma } from '@/lib/prisma';


export default async function DeliveryPage() {
const page = await prisma.staticPage.findUnique({ where: { slug: 'delivery' } });
const content = page?.content ?? `
<h2>Доставка</h2>
<p>Заказы по России, СНГ и миру отправляются транспортной компанией СДЭК. Сроки доставки и обработки заказа — до 21 рабочего дня. Точные сроки формируются в соответствии с условиями партнёра-перевозчика.</p>
<p>Все вопросы отправляйте на la.criminalite.official@gmail.com</p>
`;


return (
<main className="container mx-auto px-4 py-12">
<section className="max-w-3xl mx-auto prose">
<div dangerouslySetInnerHTML={{ __html: content }} />
</section>
</main>
);
}