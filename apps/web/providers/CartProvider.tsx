'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  maxQuantity: number;
  collection?: string;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addItem: (product: any, size: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  checkStock: (productId: string, size: string, quantity: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  initialCart?: CartItem[];
}

export function CartProvider({ children, initialCart = [] }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(initialCart);
  const [isLoading, setIsLoading] = useState(false);

  // Синхронизация с localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = async (product: any, size: string, quantity: number) => {
    setIsLoading(true);
    try {
      // Проверяем остатки через API
      const response = await fetch(`/api/products/${product.id}/stock?size=${size}`);
      const stockData = await response.json();
      
      if (stockData.available < quantity) {
        throw new Error('Недостаточно товара в наличии');
      }

      setItems(prev => {
        const existingItemIndex = prev.findIndex(
          item => item.productId === product.id && item.size === size
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...prev];
          const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
          
          if (newQuantity > stockData.available) {
            throw new Error('Недостаточно товара в наличии');
          }

          updatedItems[existingItemIndex].quantity = newQuantity;
          updatedItems[existingItemIndex].maxQuantity = stockData.available;
          return updatedItems;
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${size}`,
            productId: product.id,
            name: product.name,
            price: product.salePrice || product.price,
            image: product.images[0],
            size,
            quantity,
            maxQuantity: stockData.available,
            collection: product.collection,
          };
          return [...prev, newItem];
        }
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (productId: string, size: string) => {
    setItems(prev => 
      prev.filter(item => !(item.productId === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const checkStock = async (productId: string, size: string, quantity: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}/stock?size=${size}`);
      const stockData = await response.json();
      return stockData.available >= quantity;
    } catch (error) {
      console.error('Failed to check stock:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        checkStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}