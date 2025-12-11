import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Настройки уровней лояльности
const LOYALTY_LEVELS = [
  { level: 0, minAmount: 0, discount: 0, label: 'Новичок' },
  { level: 1, minAmount: 25000, discount: 5, label: 'Бронза' },
  { level: 2, minAmount: 50000, discount: 10, label: 'Серебро' },
  { level: 3, minAmount: 100000, discount: 15, label: 'Золото' }
];

// GET /api/loyalty - Получить информацию о программе лояльности
export async function GET(request: NextRequest) {
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
      include: {
        loyalty: true,
        orders: {
          where: { 
            status: 'DELIVERED',
            paymentStatus: 'PAID'
          },
          select: { total: true, createdAt: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Рассчитываем общую сумму покупок
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = user.orders.length;

    // Определяем текущий уровень
    let currentLevel = 0;
    let nextLevel = LOYALTY_LEVELS[1];
    let progress = 0;

    for (let i = LOYALTY_LEVELS.length - 1; i >= 0; i--) {
      if (totalSpent >= LOYALTY_LEVELS[i].minAmount) {
        currentLevel = LOYALTY_LEVELS[i].level;
        nextLevel = LOYALTY_LEVELS[i + 1] || LOYALTY_LEVELS[i];
        
        if (nextLevel.minAmount > LOYALTY_LEVELS[i].minAmount) {
          const range = nextLevel.minAmount - LOYALTY_LEVELS[i].minAmount;
          const progressInRange = totalSpent - LOYALTY_LEVELS[i].minAmount;
          progress = Math.min(100, (progressInRange / range) * 100);
        } else {
          progress = 100;
        }
        break;
      }
    }

    const currentLevelData = LOYALTY_LEVELS.find(l => l.level === currentLevel);
    const discount = currentLevelData?.discount || 0;

    // Обновляем или создаем запись лояльности
    let loyalty = user.loyalty;
    
    if (!loyalty) {
      loyalty = await prisma.loyalty.create({
        data: {
          userId: user.id,
          totalSpent,
          totalOrders,
          currentLevel,
          discount,
          points: Math.floor(totalSpent / 100) // 1 балл за каждые 100 руб
        }
      });
    } else if (loyalty.totalSpent !== totalSpent || loyalty.currentLevel !== currentLevel) {
      loyalty = await prisma.loyalty.update({
        where: { id: loyalty.id },
        data: {
          totalSpent,
          totalOrders,
          currentLevel,
          discount,
          points: Math.floor(totalSpent / 100)
        }
      });
    }

    // Получаем историю начисления баллов
    const pointHistory = await prisma.loyaltyPointHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Рассчитываем следующие уровни
    const nextLevels = LOYALTY_LEVELS.filter(level => level.level > currentLevel);
    const remainingForNextLevel = nextLevel ? Math.max(0, nextLevel.minAmount - totalSpent) : 0;

    return NextResponse.json({
      loyalty: {
        ...loyalty,
        totalSpent,
        totalOrders,
        progress,
        currentLevelData,
        nextLevel,
        remainingForNextLevel,
        nextLevels
      },
      pointHistory,
      levels: LOYALTY_LEVELS
    });
  } catch (error) {
    console.error('Loyalty API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении информации о лояльности' },
      { status: 500 }
    );
  }
}

// POST /api/loyalty/apply-discount - Применить скидку лояльности
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Не указан ID заказа' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { loyalty: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    if (!user.loyalty || user.loyalty.discount === 0) {
      return NextResponse.json(
        { error: 'У вас нет доступных скидок' },
        { status: 400 }
      );
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Рассчитываем сумму скидки
    const discountAmount = (order.subtotal * user.loyalty.discount) / 100;
    const newTotal = order.total - discountAmount;

    // Обновляем заказ
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        discount: discountAmount,
        total: newTotal
      }
    });

    // Создаем историю использования скидки
    await prisma.loyaltyDiscountUsage.create({
      data: {
        userId: user.id,
        orderId: orderId,
        discountPercent: user.loyalty.discount,
        discountAmount,
        originalTotal: order.total,
        newTotal
      }
    });

    return NextResponse.json({
      success: true,
      discountAmount,
      newTotal,
      message: `Скидка ${user.loyalty.discount}% применена успешно`
    });
  } catch (error) {
    console.error('Loyalty API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при применении скидки' },
      { status: 500 }
    );
  }
}