'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import StockBadge from '@/components/catalog/StockBadge/StockBadge';
import QuickViewModal from '@/components/catalog/QuickViewModal/QuickViewModal';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    salePrice?: number;
    images: string[];
    collection: 'LIMITED' | 'REGULAR';
    category: string;
    isNew: boolean;
    isSale: boolean;
    isBestSeller: boolean;
    totalStock: number;
    availableStock: number;
  };
  view?: 'grid' | 'list';
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // В реальном приложении здесь будет модалка выбора размера
    addItem(product, 'M', 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const productUrl = `/catalog/product/${product.slug}`;

  if (view === 'list') {
    return (
      <>
        <Link
          href={productUrl}
          className="group flex gap-6 border rounded-xl p-4 hover:shadow-lg transition-shadow"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Изображение */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 128px, 192px"
            />
            <div className="absolute top-2 left-2 z-10">
              <StockBadge stock={product.availableStock} />
            </div>
          </div>

          {/* Информация */}
          <div className="flex-1">
            <div className="mb-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                product.collection === 'LIMITED' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {product.collection}
              </span>
              {product.isNew && (
                <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                  NEW
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2 group-hover:text-red-600 transition-colors">
              {product.name}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.category}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">
                  {product.salePrice 
                    ? formatPrice(product.salePrice)
                    : formatPrice(product.price)}
                </div>
                {product.salePrice && (
                  <div className="text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full hover:bg-gray-100 ${
                    isWishlisted ? 'text-red-600' : 'text-gray-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuickView(true);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </Link>

        <QuickViewModal
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          product={product}
        />
      </>
    );
  }

  // Grid view (по умолчанию)
  return (
    <>
      <Link
        href={productUrl}
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              isHovered ? 'scale-105' : ''
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Лейблы */}
          <div className="absolute top-3 left-3 z-10 space-y-2">
            <StockBadge stock={product.availableStock} />
            
            {product.collection === 'LIMITED' && (
              <div className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold uppercase">
                LIMITED
              </div>
            )}
            
            {product.isNew && (
              <div className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                NEW
              </div>
            )}
            
            {product.isSale && (
              <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                SALE
              </div>
            )}
            
            {product.isBestSeller && (
              <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                BEST
              </div>
            )}
          </div>

          {/* Кнопки действий на ховере */}
          <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 ${
            product.availableStock === 0 ? 'cursor-not-allowed' : ''
          }`}>
            <button
              onClick={handleAddToCart}
              disabled={product.availableStock === 0}
              className={`p-3 rounded-full ${
                product.availableStock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
            <button
              onClick={handleWishlistToggle}
              className="p-3 rounded-full bg-white hover:bg-gray-100"
            >
              <Heart className={`h-5 w-5 ${
                isWishlisted ? 'fill-red-600 text-red-600' : ''
              }`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="p-3 rounded-full bg-white hover:bg-gray-100"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-bold">
                {product.salePrice 
                  ? formatPrice(product.salePrice)
                  : formatPrice(product.price)}
              </div>
              {product.salePrice && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {product.availableStock > 0 
                ? `${product.availableStock} шт.`
                : 'Нет в наличии'}
            </div>
          </div>
        </div>
      </Link>

      <QuickViewModal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={product}
      />
    </>
  );
}