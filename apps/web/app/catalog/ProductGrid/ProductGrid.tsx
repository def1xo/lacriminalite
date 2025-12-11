import ProductCard from '@/components/catalog/ProductCard/ProductCard';

interface ProductGridProps {
  products: Array<{
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
  }>;
  view?: 'grid' | 'list';
}

export default function ProductGrid({ products, view = 'grid' }: ProductGridProps) {
  if (view === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} view="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} view="grid" />
      ))}
    </div>
  );
}