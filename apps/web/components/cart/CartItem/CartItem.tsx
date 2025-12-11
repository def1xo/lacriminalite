'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
    maxQuantity: number;
    collection?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  isSelected,
  onSelect,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (item.quantity < item.maxQuantity) {
      onQuantityChange(item.quantity + 1);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    // Небольшая задержка для анимации
    await new Promise(resolve => setTimeout(resolve, 300));
    onRemove();
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Здесь будет вызов API для добавления в избранное
  };

  return (
    <div className={`bg-white rounded-xl border p-4 transition-all ${
      isRemoving ? 'opacity-0 scale-95' : ''
    }`}>
      <div className="flex gap-4">
        {/* Чекбокс выбора */}
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black mt-1"
          />
        </div>

        {/* Изображение */}
        <div className="relative h-24 w-24 flex-shrink-0">
          <Link href={`/catalog/product/${item.productId}`}>
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover rounded-lg"
              sizes="96px"
            />
          </Link>
          {item.collection === 'LIMITED' && (
            <div className="absolute top-1 left-1 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
              LTD
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <Link 
                href={`/catalog/product/${item.productId}`}
                className="font-medium hover:text-red-600 transition-colors"
              >
                {item.name}
              </Link>
              <div className="text-sm text-gray-600 mt-1">
                Размер: <span className="font-medium">{item.size}</span>
              </div>
              <div className="text-sm text-gray-600">
                Коллекция: <span className="font-medium">{item.collection || 'REGULAR'}</span>
              </div>
            </div>

            {/* Цена */}
            <div className="text-right">
              <div className="font-bold text-lg">
                {formatPrice(item.price * item.quantity)}
              </div>
              <div className="text-sm text-gray-600">
                {formatPrice(item.price)} × {item.quantity}
              </div>
            </div>
          </div>

          {/* Управление количеством и действиями */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {/* Счетчик количества */}
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={handleQuantityDecrease}
                  disabled={item.quantity <= 1}
                  className="px-3 py-1 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-3 py-1 border-x font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={handleQuantityIncrease}
                  disabled={item.quantity >= item.maxQuantity}
                  className="px-3 py-1 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Макс: {item.maxQuantity}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToWishlist}
                className={`p-2 rounded-lg hover:bg-gray-100 ${
                  isWishlisted ? 'text-red-600' : 'text-gray-600'
                }`}
                title="Добавить в избранное"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleRemove}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Удалить"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}