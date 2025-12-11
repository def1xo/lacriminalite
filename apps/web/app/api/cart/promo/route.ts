import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// POST /api/cart/promo - Применить промокод
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { promoCode, items } = await request.json();

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Не указан промокод' },
        { status: 400 }
      );
    }

    // Находим промокод в базе
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: promoCode.toUpperCase(),
        isActive: true,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    });

    if (!promo) {
      return NextResponse.json(
        { error: 'Промокод не действителен или истек' },
        { status: 400 }
      );
    }

    // Проверяем лимиты использования
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем, использовал ли пользователь уже этот промокод
    const usageCount = await prisma.promoUsage.count({
      where: {
        userId: user.id,
        promoCodeId: promo.id
      }
    });

    if (usageCount >= promo.usageLimitPerUser) {
      return NextResponse.json(
        { error: 'Вы уже использовали этот промокод максимальное количество раз' },
        { status: 400 }
      );
    }

    // Проверяем общий лимит использования
    const totalUsageCount = await prisma.promoUsage.count({
      where: { promoCodeId: promo.id }
    });

    if (totalUsageCount >= promo.totalUsageLimit) {
      return NextResponse.json(
        { error: 'Промокод уже использован максимальное количество раз' },
        { status: 400 }
      );
    }

    // Проверяем минимальную сумму заказа
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
        id: { in: items }
      },
      include: {
        product: true
      }
    });

    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return NextResponse.json(
        { 
          error: `Минимальная сумма заказа для этого промокода: ${promo.minOrderAmount} ₽`,
          requiredAmount: promo.minOrderAmount,
          currentAmount: subtotal
        },
        { status: 400 }
      );
    }

    // Рассчитываем скидку
    let discountAmount = 0;
    
    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else if (promo.discountType === 'FIXED') {
      discountAmount = promo.discountValue;
    }

    // Проверяем, что скидка не больше суммы заказа
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    // Сохраняем использование промокода
    await prisma.promoUsage.create({
      data: {
        userId: user.id,
        promoCodeId: promo.id,
        discountAmount,
        orderAmount: subtotal
      }
    });

    return NextResponse.json({
      success: true,
      discountAmount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      promoName: promo.name,
      message: 'Промокод успешно применен'
    });

  } catch (error) {
    console.error('Promo API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при применении промокода' },
      { status: 500 }
    );
  }
}