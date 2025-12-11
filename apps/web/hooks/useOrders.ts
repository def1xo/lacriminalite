import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface OrderItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    images: string[];
    slug: string;
  };
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingMethod: string;
  shippingAddress: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  trackingNumber?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке заказов');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Заказ не найден');
      }

      const data = await response.json();
      return data.order;
    } catch (err) {
      console.error('Error fetching order:', err);
      return null;
    }
  };

  const getRecentOrders = (limit: number): Order[] => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const getOrdersByStatus = (status: string): Order[] => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status.toUpperCase());
  };

  const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса');
      }

      // Обновляем локальное состояние
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: status as any }
          : order
      ));

      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    }
  };

  const cancelOrder = async (orderId: string, reason?: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'CANCELLED');
  };

  const getActiveOrders = (): Order[] => {
    return orders.filter(order => 
      ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)
    );
  };

  const getCompletedOrders = (): Order[] => {
    return orders.filter(order => order.status === 'DELIVERED');
  };

  const getCancelledOrders = (): Order[] => {
    return orders.filter(order => order.status === 'CANCELLED');
  };

  const getTotalSpent = (): number => {
    return orders
      .filter(order => order.status === 'DELIVERED')
      .reduce((total, order) => total + order.total, 0);
  };

  return {
    orders,
    isLoading,
    error,
    loadOrders,
    getOrderById,
    getRecentOrders,
    getOrdersByStatus,
    updateOrderStatus,
    cancelOrder,
    getActiveOrders,
    getCompletedOrders,
    getCancelledOrders,
    getTotalSpent
  };
}