import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// POST /api/orders - Создать новый заказ
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const orderData = await request.json();
    
    // Генерируем номер заказа
    const orderNumber = `LC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Создаем заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Создаем заказ
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
          customerEmail: orderData.customer.email,
          customerPhone: orderData.customer.phone,
          shippingAddress: `${orderData.shipping.address.city}, ${orderData.shipping.address.street}, ${orderData.shipping.address.apartment || ''}`,
          shippingMethod: orderData.shipping.method.toUpperCase(),
          shippingCost: orderData.shipping.price,
          subtotal: orderData.payment.total - orderData.shipping.price,
          total: orderData.payment.total,
          paymentMethod: orderData.payment.method.toUpperCase(),
          comment: orderData.comment || null,
          status: 'PENDING'
        }
      });

      // Добавляем товары в заказ
      for (const item of orderData.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Товар ${item.productId} не найден`);
        }

        // Проверяем остатки
        const sizeVariant = await tx.sizeVariant.findFirst({
          where: {
            productId: item.productId,
            size: item.size
          }
        });

        if (!sizeVariant || sizeVariant.quantity < item.quantity) {
          throw new Error(`Недостаточно товара ${product.name} размера ${item.size}`);
        }

        // Создаем запись в заказе
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.price
          }
        });

        // Уменьшаем остатки
        await tx.sizeVariant.update({
          where: { id: sizeVariant.id },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        // Увеличиваем общие продажи товара
        await tx.product.update({
          where: { id: item.productId },
          data: {
            totalStock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Обновляем лояльность пользователя
      if (orderData.discount?.type === 'loyalty') {
        await tx.loyalty.upsert({
          where: { userId: user.id },
          update: {
            totalSpent: { increment: orderData.payment.total },
            totalOrders: { increment: 1 }
          },
          create: {
            userId: user.id,
            totalSpent: orderData.payment.total,
            totalOrders: 1
          }
        });
      }

      // Очищаем корзину пользователя
      await tx.cartItem.deleteMany({
        where: { userId: user.id }
      });

      return order;
    });

    // Создаем платеж в ЮKassa
    const paymentData = {
      amount: {
        value: order.total.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order.id}`
      },
      description: `Заказ ${order.orderNumber} в La Criminalite`,
      metadata: {
        orderId: order.id,
        userId: user.id
      }
    };

    const paymentResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64')}`,
        'Idempotence-Key': order.id,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await paymentResponse.json();

    if (paymentResponse.ok) {
      // Обновляем заказ с ID платежа
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: payment.id,
          paymentUrl: payment.confirmation?.confirmation_url
        }
      });

      // Отправляем уведомление в Telegram (если настроено)
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const message = `
🎉 Новый заказ #${order.orderNumber}

👤 Клиент: ${order.customerName}
📧 Email: ${order.customerEmail}
📱 Телефон: ${order.customerPhone}

📍 Адрес: ${order.shippingAddress}
🚚 Доставка: ${order.shippingMethod}

💰 Сумма: ${order.total} ₽
💳 Способ оплаты: ${order.paymentMethod}

🛒 Товары:
${orderData.items.map((item: any, index: number) => 
  `${index + 1}. ${item.name} - ${item.size} x ${item.quantity} = ${item.price * item.quantity} ₽`
).join('\n')}

🔗 Ссылка на оплату: ${payment.confirmation?.confirmation_url}
        `.trim();

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
          })
        });
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: payment.confirmation?.confirmation_url,
      message: 'Заказ успешно создан'
    });

  } catch (error: any) {
    console.error('Order API error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Ошибка при создании заказа',
        details: error.message
      },
      { status: 500 }
    );
  }
}