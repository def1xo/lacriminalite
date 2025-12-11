import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductGrid from '@/components/catalog/ProductGrid/ProductGrid';
import CollectionHero from '@/components/catalog/CollectionHero/CollectionHero';
import CollectionFilters from '@/components/catalog/CollectionFilters/CollectionFilters';
import CatalogSkeleton from '@/components/catalog/CatalogSkeleton/CatalogSkeleton';
import { getProductsByCollection } from '@/lib/api/products';
import { COLLECTIONS } from '@/lib/constants/catalog';

interface CollectionPageProps {
  params: {
    collection: 'limited' | 'regular';
  };
  searchParams: {
    category?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    view?: 'grid' | 'list';
    page?: string;
  };
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const collection = COLLECTIONS.find(c => c.slug === params.collection);
  
  if (!collection) {
    return {
      title: 'Коллекция не найдена | La Criminalite',
      description: 'Запрошенная коллекция не найдена',
    };
  }

  return {
    title: `${collection.name} Коллекция | La Criminalite`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { collection: collectionSlug } = params;
  const collection = COLLECTIONS.find(c => c.slug === collectionSlug);

  if (!collection) {
    notFound();
  }

  const {
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
      {/* Hero секция коллекции */}
      <CollectionHero collection={collection} />

      {/* Контент */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Фильтры */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-32">
              <CollectionFilters
                collectionSlug={collectionSlug}
                defaultCategory={category}
                defaultSize={size}
                defaultMinPrice={minPrice}
                defaultMaxPrice={maxPrice}
              />
            </div>
          </aside>

          {/* Продукты */}
          <main className="flex-1">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {collection.name} Коллекция
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {collection.productsCount} товаров
                  </p>
                </div>
                
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
              </div>
            </div>

            <Suspense fallback={<CatalogSkeleton view={view} />}>
              <CollectionProducts
                collectionSlug={collectionSlug}
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

// Компонент для загрузки продуктов коллекции
async function CollectionProducts({
  collectionSlug,
  category,
  size,
  minPrice,
  maxPrice,
  sort,
  view,
  page,
}: {
  collectionSlug: string;
  category?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  sort: string;
  view: string;
  page: number;
}) {
  const products = await getProductsByCollection({
    collection: collectionSlug as 'limited' | 'regular',
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
          <div className="text-6xl mb-4">
            {collectionSlug === 'limited' ? '🌟' : '👕'}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {collectionSlug === 'limited' 
              ? 'В LIMITED коллекции пока нет товаров' 
              : 'В REGULAR коллекции пока нет товаров'}
          </h3>
          <p className="text-gray-600 mb-6">
            Скоро появятся новые модели. Следите за обновлениями!
          </p>
          <a
            href="/catalog"
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
          >
            Смотреть все коллекции
          </a>
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