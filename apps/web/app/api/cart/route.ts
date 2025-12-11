import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/cart - Получить корзину пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
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

    if (!user) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const items = user.cart.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
      size: item.size,
      quantity: item.quantity,
      maxQuantity: item.product.sizes.find(s => s.size === item.size)?.quantity || 0,
      collection: item.product.collection
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении корзины' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { productId, size, quantity } = await request.json();

    if (!productId || !size || !quantity) {
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
        { status: 400 }
      );
    }

    // Проверяем наличие товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { sizes: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Проверяем наличие выбранного размера
    const sizeVariant = product.sizes.find(s => s.size === size);
    if (!sizeVariant) {
      return NextResponse.json(
        { error: 'Выбранный размер недоступен' },
        { status: 400 }
      );
    }

    // Проверяем остатки
    if (sizeVariant.quantity < quantity) {
      return NextResponse.json(
        { error: 'Недостаточно товара в наличии' },
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

    // Проверяем, есть ли уже такой товар в корзине
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        size
      }
    });

    if (existingCartItem) {
      // Обновляем количество
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > sizeVariant.quantity) {
        return NextResponse.json(
          { error: 'Недостаточно товара в наличии' },
          { status: 400 }
        );
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity }
      });

      return NextResponse.json({ 
        success: true, 
        item: updatedItem,
        message: 'Количество товара обновлено'
      });
    } else {
      // Добавляем новый товар
      const newItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          size,
          quantity
        }
      });

      return NextResponse.json({ 
        success: true, 
        item: newItem,
        message: 'Товар добавлен в корзину'
      });
    }
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в корзину' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Удалить товар из корзины
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const size = searchParams.get('size');

    if (!productId || !size) {
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
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

    // Находим и удаляем товар
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        size
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Товар не найден в корзине' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Товар удален из корзины'
    });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении из корзины' },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Обновить количество товара
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { productId, size, quantity } = await request.json();

    if (!productId || !size || quantity === undefined) {
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Количество должно быть больше 0' },
        { status: 400 }
      );
    }

    // Проверяем наличие товара и остатки
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { sizes: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    const sizeVariant = product.sizes.find(s => s.size === size);
    if (!sizeVariant) {
      return NextResponse.json(
        { error: 'Выбранный размер недоступен' },
        { status: 400 }
      );
    }

    if (sizeVariant.quantity < quantity) {
      return NextResponse.json(
        { error: 'Недостаточно товара в наличии' },
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

    // Находим товар в корзине
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        size
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Товар не найден в корзине' },
        { status: 404 }
      );
    }

    // Обновляем количество
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity }
    });

    return NextResponse.json({ 
      success: true, 
      item: updatedItem,
      message: 'Количество товара обновлено'
    });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении корзины' },
      { status: 500 }
    );
  }
}