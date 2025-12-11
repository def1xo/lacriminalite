import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Truck, 
  RotateCcw, 
  Shield, 
  Package,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ProductGallery from '@/components/catalog/ProductGallery/ProductGallery';
import ProductInfo from '@/components/catalog/ProductInfo/ProductInfo';
import SizeSelector from '@/components/catalog/SizeSelector/SizeSelector';
import ProductActions from '@/components/catalog/ProductActions/ProductActions';
import StockCounter from '@/components/catalog/StockCounter/StockCounter';
import RelatedProducts from '@/components/catalog/RelatedProducts/RelatedProducts';
import { getProductBySlug, getRelatedProducts } from '@/lib/api/products';
import { formatPrice } from '@/lib/utils/format';
import { SITE_CONFIG } from '@/lib/config/site';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Товар не найден | La Criminalite',
      description: 'Запрошенный товар не найден',
    };
  }

  return {
    title: `${product.name} | La Criminalite`,
    description: product.description.substring(0, 160),
    openGraph: {
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.collection);

  return (
    <div className="min-h-screen">
      {/* Навигация */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/catalog/${product.collection.toLowerCase()}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад к {product.collection === 'LIMITED' ? 'LIMITED' : 'REGULAR'} коллекции
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Link href="/catalog" className="text-gray-600 hover:text-black">
                  Каталог
                </Link>
                <span className="text-gray-400">/</span>
                <Link 
                  href={`/catalog/${product.collection.toLowerCase()}`}
                  className="text-gray-600 hover:text-black"
                >
                  {product.collection === 'LIMITED' ? 'LIMITED' : 'REGULAR'}
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-black">{product.category}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                <Share2 className="h-4 w-4" />
                Поделиться
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                <Heart className="h-4 w-4" />
                В избранное
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Галерея товара */}
          <div>
            <ProductGallery images={product.images} />
          </div>

          {/* Информация о товаре */}
          <div className="space-y-6">
            {/* Название и цена */}
            <div>
              <div className="mb-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  product.collection === 'LIMITED' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.collection === 'LIMITED' ? 'LIMITED' : 'REGULAR'}
                </span>
                {product.isNew && (
                  <span className="ml-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                    NEW
                  </span>
                )}
                {product.isSale && (
                  <span className="ml-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                    SALE
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    {product.isSale && product.salePrice 
                      ? formatPrice(product.salePrice)
                      : formatPrice(product.price)}
                  </div>
                  {product.isSale && product.salePrice && (
                    <>
                      <div className="ml-3 text-lg text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                      <div className="ml-3 px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-bold">
                        -{Math.round((1 - product.salePrice / product.price) * 100)}%
                      </div>
                    </>
                  )}
                </div>
                
                <StockCounter 
                  totalStock={product.totalStock}
                  availableStock={product.availableStock}
                />
              </div>
            </div>

            {/* Рейтинг и отзывы */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (product.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating?.toFixed(1) || '4.5'}
                </span>
              </div>
              <Link 
                href="#reviews" 
                className="text-sm text-gray-600 hover:text-black"
              >
                {product.reviewCount || 12} отзывов
              </Link>
            </div>

            {/* Выбор размера */}
            <SizeSelector
              sizes={product.sizes}
              productId={product.id}
              selectedSize={null}
              onSizeSelect={(size) => console.log('Selected size:', size)}
            />

            {/* Описание */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Описание</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {product.description}
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Коллекция</div>
                  <div className="font-medium">{product.collection}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Категория</div>
                  <div className="font-medium">{product.category}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Состав</div>
                  <div className="font-medium">{product.material || 'Хлопок 100%'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Страна</div>
                  <div className="font-medium">{product.country || 'Россия'}</div>
                </div>
              </div>
            </div>

            {/* Действия с товаром */}
            <ProductActions
              product={product}
              onAddToCart={(size, quantity) => console.log('Add to cart:', size, quantity)}
              onAddToWishlist={() => console.log('Add to wishlist')}
            />

            {/* Доставка и возврат */}
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Доставка и возврат</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Быстрая доставка</div>
                    <div className="text-sm text-gray-600">
                      От 1 дня по России
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Легкий возврат</div>
                    <div className="text-sm text-gray-600">
                      В течение 14 дней
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Гарантия качества</div>
                    <div className="text-sm text-gray-600">
                      Официальная гарантия
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Социальные доказательства */}
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Почему выбирают нас</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Купили за последний месяц</span>
                  <span className="font-semibold">{product.soldLastMonth || 124} шт.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">В избранном у</span>
                  <span className="font-semibold">{product.wishlistCount || 56} чел.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Рейтинг товара</span>
                  <span className="font-semibold">{product.rating || 4.5}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Табы с дополнительной информацией */}
        <div className="mt-16">
          <div className="border-b">
            <nav className="flex space-x-8">
              {['Описание', 'Размеры', 'Доставка', 'Отзывы'].map((tab) => (
                <button
                  key={tab}
                  className={`py-4 px-1 font-medium border-b-2 ${
                    tab === 'Описание'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="py-8">
            <div className="prose max-w-none">
              {/* Контент табов */}
              <div id="description">
                <h3 className="text-2xl font-bold mb-4">Детальное описание</h3>
                <p className="text-gray-700">
                  {product.detailedDescription || product.description}
                </p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3">Характеристики</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Материал</span>
                        <span className="font-medium">100% хлопок</span>
                      </li>
                      <li className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Плотность</span>
                        <span className="font-medium">340 г/м²</span>
                      </li>
                      <li className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Производство</span>
                        <span className="font-medium">Россия</span>
                      </li>
                      <li className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Уход</span>
                        <span className="font-medium">Машинная стирка 30°C</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Таблица размеров</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Размер</th>
                            <th className="text-left py-2">Грудь (см)</th>
                            <th className="text-left py-2">Длина (см)</th>
                            <th className="text-left py-2">Рукав (см)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">S</td>
                            <td className="py-2">104-108</td>
                            <td className="py-2">68-70</td>
                            <td className="py-2">62-64</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">M</td>
                            <td className="py-2">112-116</td>
                            <td className="py-2">70-72</td>
                            <td className="py-2">64-66</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">L</td>
                            <td className="py-2">120-124</td>
                            <td className="py-2">72-74</td>
                            <td className="py-2">66-68</td>
                          </tr>
                          <tr>
                            <td className="py-2">XL</td>
                            <td className="py-2">128-132</td>
                            <td className="py-2">74-76</td>
                            <td className="py-2">68-70</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Похожие товары */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Похожие товары</h2>
              <Link
                href={`/catalog/${product.collection.toLowerCase()}`}
                className="flex items-center gap-2 text-black hover:text-gray-800"
              >
                Смотреть все
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}