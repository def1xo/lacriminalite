import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Loyalty {
  id: string;
  userId: string;
  totalSpent: number;
  totalOrders: number;
  currentLevel: number;
  discount: number;
  points: number;
  progress: number;
  nextLevel?: {
    level: number;
    minAmount: number;
    discount: number;
    label: string;
  };
  remainingForNextLevel: number;
  currentLevelData?: {
    level: number;
    minAmount: number;
    discount: number;
    label: string;
  };
}

export function useLoyalty() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLoyalty();
    }
  }, [user]);

  const loadLoyalty = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/loyalty');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке программы лояльности');
      }

      const data = await response.json();
      setLoyalty(data.loyalty);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading loyalty:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyDiscount = async (orderId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/loyalty/apply-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error('Ошибка при применении скидки');
      }

      return true;
    } catch (err) {
      console.error('Error applying discount:', err);
      return false;
    }
  };

  const getLevelInfo = (level: number) => {
    const levels = [
      { level: 0, minAmount: 0, discount: 0, label: 'Новичок' },
      { level: 1, minAmount: 25000, discount: 5, label: 'Бронза' },
      { level: 2, minAmount: 50000, discount: 10, label: 'Серебро' },
      { level: 3, minAmount: 100000, discount: 15, label: 'Золото' }
    ];

    return levels.find(l => l.level === level);
  };

  const getNextLevel = () => {
    if (!loyalty) return null;
    
    const levels = [
      { level: 0, minAmount: 0, discount: 0, label: 'Новичок' },
      { level: 1, minAmount: 25000, discount: 5, label: 'Бронза' },
      { level: 2, minAmount: 50000, discount: 10, label: 'Серебро' },
      { level: 3, minAmount: 100000, discount: 15, label: 'Золото' }
    ];

    return levels.find(l => l.level === loyalty.currentLevel + 1);
  };

  return {
    loyalty,
    isLoading,
    error,
    loadLoyalty,
    applyDiscount,
    getLevelInfo,
    getNextLevel
  };
}