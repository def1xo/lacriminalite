import { prisma } from '@/lib/prisma';


export default async function PrivacyPage() {
const page = await prisma.staticPage.findUnique({ where: { slug: 'privacy' } });
const content = page?.content ?? `
<h2>Политика конфиденциальности</h2>
<p>Настоящая Политика применяется ко всей информации, которую Оператор может получить о посетителях сайта https://lacriminalite.ru. Оператор ставит своей целью соблюдение прав и свобод человека и гражданина при обработке персональных данных, в том числе защиту права на неприкосновенность частной жизни.</p>
`;


return (
<main className="container mx-auto px-4 py-12">
<section className="max-w-4xl mx-auto prose">
<div dangerouslySetInnerHTML={{ __html: content }} />
</section>
</main>
);
}