import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/addresses - Получить адреса пользователя
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
        addresses: {
          where: { isActive: true },
          orderBy: { isDefault: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ addresses: user.addresses });
  } catch (error) {
    console.error('Addresses API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении адресов' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Создать новый адрес
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      city,
      street,
      house,
      apartment,
      entrance,
      floor,
      intercom,
      postalCode,
      isDefault,
      label
    } = data;

    // Валидация
    if (!city || !street || !house) {
      return NextResponse.json(
        { error: 'Заполните обязательные поля: город, улица, дом' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Если новый адрес делается адресом по умолчанию,
    // снимаем флаг default с других адресов
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: user.id,
          isDefault: true 
        },
        data: { isDefault: false }
      });
    }

    // Создаем новый адрес
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        city,
        street,
        house,
        apartment,
        entrance,
        floor,
        intercom,
        postalCode,
        isDefault: isDefault || false,
        label: label || `${city}, ${street}, ${house}`,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      address,
      message: 'Адрес успешно добавлен'
    });
  } catch (error) {
    console.error('Addresses API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании адреса' },
      { status: 500 }
    );
  }
}