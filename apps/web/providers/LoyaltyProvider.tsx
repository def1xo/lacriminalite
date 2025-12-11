'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface LoyaltyLevel {
  level: number;
  name: string;
  minAmount: number;
  discount: number;
  color: string;
  benefits: string[];
}

interface LoyaltyData {
  level: number;
  discount: number;
  totalSpent: number;
  totalOrders: number;
  points: number;
  nextLevel?: LoyaltyLevel;
  progress: number;
}

interface LoyaltyContextType {
  loyalty: LoyaltyData | null;
  isLoading: boolean;
  levels: LoyaltyLevel[];
  calculateLevel: (amount: number) => LoyaltyLevel;
  applyDiscount: (amount: number) => number;
  getNextLevel: (currentLevel: number) => LoyaltyLevel | null;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

const LOYALTY_LEVELS: LoyaltyLevel[] = [
  {
    level: 0,
    name: 'Новичок',
    minAmount: 0,
    discount: 0,
    color: '#6B7280',
    benefits: ['Бесплатная доставка от 10,000 ₽', 'Уведомления о новинках']
  },
  {
    level: 1,
    name: 'Бронза',
    minAmount: 25000,
    discount: 5,
    color: '#CD7F32',
    benefits: ['Скидка 5% на все покупки', 'Приоритетная поддержка', 'Эксклюзивные промокоды']
  },
  {
    level: 2,
    name: 'Серебро',
    minAmount: 50000,
    discount: 10,
    color: '#C0C0C0',
    benefits: ['Скидка 10% на все покупки', 'Бесплатная доставка', 'Примерка на дом', 'Возврат 30 дней']
  },
  {
    level: 3,
    name: 'Золото',
    minAmount: 100000,
    discount: 15,
    color: '#FFD700',
    benefits: ['Скидка 15% на все покупки', 'Персональный менеджер', 'Доступ к лимитированным коллекциям', 'Подарки на день рождения']
  }
];

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    } else {
      setLoyalty(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/loyalty/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const currentLevel = calculateLevel(data.totalSpent);
        const nextLevel = getNextLevel(currentLevel.level);
        
        const progress = nextLevel 
          ? ((data.totalSpent - currentLevel.minAmount) / (nextLevel.minAmount - currentLevel.minAmount)) * 100
          : 100;

        setLoyalty({
          level: currentLevel.level,
          discount: currentLevel.discount,
          totalSpent: data.totalSpent,
          totalOrders: data.totalOrders,
          points: data.points || 0,
          nextLevel,
          progress: Math.min(100, Math.max(0, progress))
        });
      }
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLevel = (amount: number): LoyaltyLevel => {
    let currentLevel = LOYALTY_LEVELS[0];
    
    for (const level of LOYALTY_LEVELS) {
      if (amount >= level.minAmount) {
        currentLevel = level;
      } else {
        break;
      }
    }
    
    return currentLevel;
  };

  const applyDiscount = (amount: number): number => {
    if (!loyalty) return amount;
    return amount * (1 - loyalty.discount / 100);
  };

  const getNextLevel = (currentLevel: number): LoyaltyLevel | null => {
    const nextLevelIndex = LOYALTY_LEVELS.findIndex(level => level.level === currentLevel) + 1;
    return LOYALTY_LEVELS[nextLevelIndex] || null;
  };

  return (
    <LoyaltyContext.Provider
      value={{
        loyalty,
        isLoading,
        levels: LOYALTY_LEVELS,
        calculateLevel,
        applyDiscount,
        getNextLevel,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
}