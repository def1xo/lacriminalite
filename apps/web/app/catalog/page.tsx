import { Suspense } from 'react';
import { Filter, Grid3X3, List } from 'lucide-react';
import ProductGrid from '@/components/catalog/ProductGrid/ProductGrid';
import ProductFilters from '@/components/catalog/ProductFilters/ProductFilters';
import CollectionTabs from '@/components/catalog/CollectionTabs/CollectionTabs';
import CatalogSkeleton from '@/components/catalog/CatalogSkeleton/CatalogSkeleton';
import { getProducts } from '@/lib/api/products';
import { CATEGORIES, SIZES, PRICE_RANGES } from '@/lib/constants/catalog';

interface CatalogPageProps {
  searchParams: {
    collection?: 'limited' | 'regular';
    category?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
    view?: 'grid' | 'list';
    page?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const {
    collection,
    category,
    size,
    minPrice,
    maxPrice,
    sort = 'newest',
    view = 'grid',
    page = '1',
  } = searchParams;

  return (
    <div className="min-h-screen">
      {/* Hero секция каталога */}
      <section className="relative py-16 bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Каталог</h1>
            <p className="text-xl text-gray-300">
              LIMITED и REGULAR коллекции. Эксклюзивные модели и базовые вещи.
            </p>
          </div>
        </div>
      </section>

      {/* Табы коллекций */}
      <div className="sticky top-16 z-30 border-b bg-white">
        <div className="container mx-auto px-4">
          <CollectionTabs activeCollection={collection} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Сайдбар с фильтрами */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-32">
              <div className="mb-6 lg:hidden">
                <button className="flex items-center gap-2 w-full justify-center py-3 border rounded-lg hover:bg-gray-50">
                  <Filter className="h-5 w-5" />
                  Фильтры
                </button>
              </div>

              <div className="hidden lg:block">
                <ProductFilters
                  categories={CATEGORIES}
                  sizes={SIZES}
                  priceRanges={PRICE_RANGES}
                  defaultCategory={category}
                  defaultSize={size}
                  defaultMinPrice={minPrice}
                  defaultMaxPrice={maxPrice}
                />
              </div>
            </div>
          </aside>

          {/* Основной контент */}
          <main className="flex-1">
            {/* Панель управления */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {collection === 'limited' ? 'LIMITED Коллекция' : 
                     collection === 'regular' ? 'REGULAR Коллекция' : 'Все товары'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {category ? `Категория: ${CATEGORIES.find(c => c.value === category)?.label}` : 'Все категории'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Сортировка */}
                  <div className="relative">
                    <select
                      defaultValue={sort}
                      className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                      onChange={(e) => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('sort', e.target.value);
                        window.location.href = url.toString();
                      }}
                    >
                      <option value="newest">Сначала новые</option>
                      <option value="popular">По популярности</option>
                      <option value="price-asc">По цене (возрастание)</option>
                      <option value="price-desc">По цене (убывание)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Переключение вида */}
                  <div className="flex items-center border rounded-lg p-1">
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('view', 'grid');
                        window.location.href = url.toString();
                      }}
                      className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      <Grid3X3 className={`h-5 w-5 ${view === 'grid' ? 'text-black' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('view', 'list');
                        window.location.href = url.toString();
                      }}
                      className={`p-2 rounded ${view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      <List className={`h-5 w-5 ${view === 'list' ? 'text-black' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Активные фильтры */}
              <div className="mt-4 flex flex-wrap gap-2">
                {category && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {CATEGORIES.find(c => c.value === category)?.label}
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('category');
                        window.location.href = url.toString();
                      }}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                )}
                {size && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                    Размер: {size.toUpperCase()}
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('size');
                        window.location.href = url.toString();
                      }}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                )}
                {(minPrice || maxPrice) && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                    Цена: {minPrice || '0'} - {maxPrice || '∞'} ₽
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('minPrice');
                        url.searchParams.delete('maxPrice');
                        window.location.href = url.toString();
                      }}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                )}
                {(category || size || minPrice || maxPrice) && (
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('category');
                      url.searchParams.delete('size');
                      url.searchParams.delete('minPrice');
                      url.searchParams.delete('maxPrice');
                      window.location.href = url.toString();
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Сбросить все фильтры
                  </button>
                )}
              </div>
            </div>

            {/* Продукты */}
            <Suspense fallback={<CatalogSkeleton view={view} />}>
              <ProductGridWrapper
                collection={collection}
                category={category}
                size={size}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sort={sort}
                view={view}
                page={parseInt(page)}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

// Отдельный компонент для загрузки продуктов
async function ProductGridWrapper({
  collection,
  category,
  size,
  minPrice,
  maxPrice,
  sort,
  view,
  page,
}: {
  collection?: string;
  category?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  sort: string;
  view: string;
  page: number;
}) {
  const products = await getProducts({
    collection: collection as 'limited' | 'regular' | undefined,
    category,
    size,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    sort,
    page,
    limit: 12,
  });

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
          <p className="text-gray-600 mb-6">
            Попробуйте изменить параметры фильтрации или выбрать другую коллекцию
          </p>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('category');
              url.searchParams.delete('size');
              url.searchParams.delete('minPrice');
              url.searchParams.delete('maxPrice');
              window.location.href = url.toString();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProductGrid products={products} view={view} />
      
      {/* Пагинация */}
      <div className="mt-12 flex justify-center">
        <nav className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('page', (page - 1).toString());
              window.location.href = url.toString();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ←
          </button>
          
          {Array.from({ length: 3 }, (_, i) => {
            const pageNum = page + i - 1;
            if (pageNum < 1) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', pageNum.toString());
                  window.location.href = url.toString();
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                  pageNum === page
                    ? 'border-black bg-black text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('page', (page + 1).toString());
              window.location.href = url.toString();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50"
          >
            →
          </button>
        </nav>
      </div>
    </>
  );
}