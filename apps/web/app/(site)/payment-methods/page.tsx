import { prisma } from '@/lib/prisma';


export default async function PaymentMethodsPage() {
const page = await prisma.staticPage.findUnique({ where: { slug: 'payment-methods' } });
const content = page?.content ?? `
<h2>Оплата</h2>
<p>Мы используем YooKassa для приёма онлайн-платежей. После создания заказа вы будете перенаправлены на форму оплаты. После подтверждения оплаты вы получите уведомление и заказ перейдёт в статус «оплачен».</p>
`;


return (
<main className="container mx-auto px-4 py-12">
<section className="max-w-3xl mx-auto prose">
<div dangerouslySetInnerHTML={{ __html: content }} />
</section>
</main>
);
}