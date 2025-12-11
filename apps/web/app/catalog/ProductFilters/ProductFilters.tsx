'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import PriceRangeSlider from '@/components/catalog/PriceRangeSlider/PriceRangeSlider';

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string; count: number }>;
  sizes: string[];
  priceRanges: Array<{ min: number; max: number; label: string }>;
  defaultCategory?: string;
  defaultSize?: string;
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
}

export default function ProductFilters({
  categories,
  sizes,
  priceRanges,
  defaultCategory,
  defaultSize,
  defaultMinPrice,
  defaultMaxPrice,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || '');
  const [selectedSize, setSelectedSize] = useState(defaultSize || '');
  const [priceRange, setPriceRange] = useState({
    min: defaultMinPrice ? parseInt(defaultMinPrice) : 0,
    max: defaultMaxPrice ? parseInt(defaultMaxPrice) : 50000,
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const updateFilters = (filters: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    
    // Сбрасываем страницу при изменении фильтров
    params.delete('page');
    
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? '' : categoryId;
    setSelectedCategory(newCategory);
    updateFilters({ category: newCategory });
  };

  const handleSizeChange = (size: string) => {
    const newSize = selectedSize === size ? '' : size;
    setSelectedSize(newSize);
    updateFilters({ size: newSize });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    updateFilters({ 
      minPrice: min > 0 ? min : undefined,
      maxPrice: max < 50000 ? max : undefined 
    });
  };

  const handlePriceRangeSelect = (range: { min: number; max: number }) => {
    setPriceRange(range);
    updateFilters({
      minPrice: range.min > 0 ? range.min : undefined,
      maxPrice: range.max < 50000 ? range.max : undefined,
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setPriceRange({ min: 0, max: 50000 });
    
    const params = new URLSearchParams(searchParams.toString());
    ['category', 'size', 'minPrice', 'maxPrice', 'page'].forEach(param => {
      params.delete(param);
    });
    
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = selectedCategory || selectedSize || 
    priceRange.min > 0 || priceRange.max < 50000;

  return (
    <>
      {/* Mobile filters button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-white shadow-lg"
        >
          <Filter className="h-5 w-5" />
          Фильтры
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile filters modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Фильтры</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Категории */}
              <div>
                <h3 className="font-semibold mb-4">Категории</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                        selectedCategory === category.id
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Размеры */}
              <div>
                <h3 className="font-semibold mb-4">Размеры</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Цена */}
              <div>
                <h3 className="font-semibold mb-4">Цена, ₽</h3>
                <PriceRangeSlider
                  min={0}
                  max={50000}
                  step={1000}
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                />
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handlePriceRangeSelect(range)}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        priceRange.min === range.min && priceRange.max === range.max
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="sticky bottom-0 bg-white pt-6 border-t">
                <div className="flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop filters */}
      <div className="hidden lg:block">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-bold">Фильтры</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Сбросить все
            </button>
          )}
        </div>

        <div className="space-y-8">
          {/* Категории */}
          <div>
            <h4 className="font-semibold mb-3">Категории</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                    selectedCategory === category.id
                      ? 'bg-gray-100 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Размеры */}
          <div>
            <h4 className="font-semibold mb-3">Размеры</h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Цена */}
          <div>
            <h4 className="font-semibold mb-3">Цена, ₽</h4>
            <PriceRangeSlider
              min={0}
              max={50000}
              step={1000}
              value={priceRange}
              onChange={handlePriceRangeChange}
            />
            
            <div className="mt-4 space-y-2">
              {priceRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handlePriceRangeSelect(range)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    priceRange.min === range.min && priceRange.max === range.max
                      ? 'bg-gray-100 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{range.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}