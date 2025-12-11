import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/profile - Получить профиль пользователя
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          where: { isActive: true },
          orderBy: { isDefault: 'desc' }
        },
        loyalty: true,
        _count: {
          select: {
            orders: true,
            wishlist: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении профиля' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Обновить профиль пользователя
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { firstName, lastName, phone } = data;

    // Валидация данных
    if (firstName && firstName.length < 2) {
      return NextResponse.json(
        { error: 'Имя должно содержать минимум 2 символа' },
        { status: 400 }
      );
    }

    if (lastName && lastName.length < 2) {
      return NextResponse.json(
        { error: 'Фамилия должна содержать минимум 2 символа' },
        { status: 400 }
      );
    }

    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Некорректный номер телефона' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        firstName,
        lastName,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user,
      message: 'Профиль успешно обновлен' 
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении профиля' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Обновить пароль
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Пароли не совпадают' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 8 символов' },
        { status: 400 }
      );
    }

    // Получаем пользователя с паролем
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем текущий пароль
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный текущий пароль' },
        { status: 400 }
      );
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Пароль успешно изменен' 
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при изменении пароля' },
      { status: 500 }
    );
  }
}