import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/orders/[id]/track - Получить информацию об отслеживании
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
      select: { 
        id: true, 
        userId: true, 
        trackingNumber: true,
        shippingMethod: true,
        deliveryData: true
      }
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

    if (!order.trackingNumber) {
      return NextResponse.json({
        tracking: [],
        message: 'Номер отслеживания не указан'
      });
    }

    // Получаем информацию об отслеживании от СДЭК
    let trackingInfo = [];
    
    if (order.shippingMethod === 'SDEK') {
      trackingInfo = await getSdekTracking(order.trackingNumber);
    } else if (order.shippingMethod === 'YANDEX_DELIVERY') {
      trackingInfo = await getYandexTracking(order.trackingNumber);
    } else {
      // Для других служб доставки
      trackingInfo = order.deliveryData as any || [];
    }

    return NextResponse.json({
      trackingNumber: order.trackingNumber,
      shippingMethod: order.shippingMethod,
      tracking: trackingInfo
    });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении информации об отслеживании' },
      { status: 500 }
    );
  }
}

// Получение информации от СДЭК API
async function getSdekTracking(trackingNumber: string) {
  try {
    const response = await fetch('https://api.cdek.ru/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CDEK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cdek_number: trackingNumber
      })
    });

    if (!response.ok) {
      throw new Error('Ошибка при запросе к API СДЭК');
    }

    const data = await response.json();
    
    return data.entity?.statuses?.map((status: any) => ({
      status: status.name,
      code: status.code,
      date: status.date_time,
      city: status.city,
      description: status.description
    })) || [];
  } catch (error) {
    console.error('SDEK tracking error:', error);
    return [];
  }
}

// Получение информации от Яндекс Доставки API
async function getYandexTracking(trackingNumber: string) {
  try {
    const response = await fetch(`https://delivery.yandex.ru/api/v2/orders/${trackingNumber}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.YANDEX_DELIVERY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при запросе к API Яндекс Доставки');
    }

    const data = await response.json();
    
    return data.status_history?.map((status: any) => ({
      status: status.status,
      date: status.updated_at,
      location: status.location?.address,
      description: status.description
    })) || [];
  } catch (error) {
    console.error('Yandex tracking error:', error);
    return [];
  }
}