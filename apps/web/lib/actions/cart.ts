'use server';

import { cookies } from 'next/headers';
import { CartItem } from '@/types/cart';

export async function getInitialCart(cookieStore: any) {
  try {
    const cartCookie = cookieStore.get('cart');
    if (cartCookie?.value) {
      return JSON.parse(cartCookie.value) as CartItem[];
    }
  } catch (error) {
    console.error('Failed to parse cart cookie:', error);
  }
  return [];
}

export async function addToCart(productId: string, size: string, quantity: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size, quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
}

export async function removeFromCart(productId: string, size: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove from cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    throw error;
  }
}

export async function updateCartQuantity(productId: string, size: string, quantity: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size, quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update cart quantity');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update cart quantity:', error);
    throw error;
  }
}