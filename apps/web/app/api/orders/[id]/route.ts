import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/orders/[id] - Получить детали заказа
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
                sku: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    // Проверяем права доступа (только владелец или админ)
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказа' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Обновить статус заказа
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { status, cancelReason } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Не указан статус' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, status: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Проверяем, можно ли изменить статус
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [], // Завершенный заказ нельзя изменить
      'CANCELLED': [] // Отмененный заказ нельзя изменить
    };

    const allowedStatuses = validTransitions[order.status];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Невозможно изменить статус с ${order.status} на ${status}` },
        { status: 400 }
      );
    }

    // Обновляем статус заказа
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: status as any,
        cancelledAt: status === 'CANCELLED' ? new Date() : null,
        cancelReason: status === 'CANCELLED' ? cancelReason : null
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                sizes: true
              }
            }
          }
        }
      }
    });

    // Если заказ отменен, возвращаем товары на склад
    if (status === 'CANCELLED') {
      for (const item of updatedOrder.items) {
        // Находим вариант размера
        const sizeVariant = item.product.sizes.find(s => s.size === item.size);
        if (sizeVariant) {
          // Возвращаем количество на склад
          await prisma.sizeVariant.update({
            where: { id: sizeVariant.id },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });

          // Обновляем общий остаток товара
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              totalStock: {
                increment: item.quantity
              }
            }
          });
        }
      }
    }

    // Отправляем уведомление пользователю
    if (order.userId === user.id) {
      await sendOrderStatusNotification(updatedOrder);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Статус заказа успешно обновлен'
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа' },
      { status: 500 }
    );
  }
}

// Уведомление об изменении статуса заказа
async function sendOrderStatusNotification(order: any) {
  try {
    // Здесь можно отправить email или push-уведомление
    const statusText = {
      'PENDING': 'ожидает оплаты',
      'PROCESSING': 'в обработке',
      'SHIPPED': 'отправлен',
      'DELIVERED': 'доставлен',
      'CANCELLED': 'отменен'
    }[order.status];

    // Отправляем email
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: order.user?.email,
        subject: `Статус вашего заказа #${order.orderNumber} изменен`,
        template: 'order-status-update',
        data: {
          orderNumber: order.orderNumber,
          status: statusText,
          orderUrl: `${process.env.NEXTAUTH_URL}/profile/orders/${order.id}`
        }
      })
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}