'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  CreditCard, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Package,
  Lock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import CheckoutProgress from '@/components/checkout/CheckoutProgress/CheckoutProgress';
import DeliveryMethods from '@/components/checkout/DeliveryMethods/DeliveryMethods';
import OrderSummary from '@/components/checkout/OrderSummary/OrderSummary';
import { formatPrice } from '@/lib/utils/format';

// Схема валидации формы
const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  city: z.string().min(2, 'Введите город'),
  street: z.string().min(5, 'Введите улицу и дом'),
  apartment: z.string().optional(),
  postalCode: z.string().min(6, 'Введите корректный индекс'),
  deliveryMethod: z.enum(['sdek', 'yandex', 'pickup', 'post']),
  paymentMethod: z.enum(['card', 'sbp', 'yoomoney', 'cash']),
  saveAddress: z.boolean().default(true),
  comment: z.string().max(500, 'Комментарий слишком длинный').optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const deliveryOptions = [
  {
    id: 'sdek',
    name: 'СДЭК',
    description: 'Курьером или в пункт выдачи',
    price: 300,
    time: '1-3 дня',
    icon: Truck,
    features: ['Трекинг', 'Страхование', 'Примерка']
  },
  {
    id: 'yandex',
    name: 'Яндекс Доставка',
    description: 'Экспресс доставка',
    price: 450,
    time: '1-2 дня',
    icon: Package,
    features: ['90 минут', 'Трекинг онлайн', 'СМС']
  },
  {
    id: 'pickup',
    name: 'Самовывоз',
    description: 'Из нашего шоурума',
    price: 0,
    time: '1-3 дня',
    icon: MapPin,
    features: ['Бесплатно', 'Примерка', 'Консультация']
  },
  {
    id: 'post',
    name: 'Почта России',
    description: 'Доставка почтой',
    price: 250,
    time: '5-14 дней',
    icon: Truck,
    features: ['Экономично', 'По всей России']
  }
];

const paymentOptions = [
  {
    id: 'card',
    name: 'Банковская карта',
    description: 'Visa, Mastercard, МИР',
    icon: CreditCard,
    recommended: true
  },
  {
    id: 'sbp',
    name: 'СБП',
    description: 'Система быстрых платежей',
    icon: CreditCard,
    recommended: true
  },
  {
    id: 'yoomoney',
    name: 'ЮMoney',
    description: 'Бывшие Яндекс.Деньги',
    icon: CreditCard
  },
  {
    id: 'cash',
    name: 'Наличные',
    description: 'При получении',
    icon: CreditCard
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { items, getTotal, getItemCount } = useCart();
  const { loyalty, applyDiscount } = useLoyalty();
  
  const [step, setStep] = useState(1);
  const [deliveryPrice, setDeliveryPrice] = useState(300);
  const [useLoyaltyDiscount, setUseLoyaltyDiscount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      deliveryMethod: 'sdek',
      paymentMethod: 'card',
      saveAddress: true
    },
    mode: 'onChange'
  });

  // Автозаполнение адреса пользователя
  useEffect(() => {
    if (user && step === 1) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
    }
  }, [user, step, setValue]);

  // Слушаем изменения метода доставки для обновления цены
  const selectedDelivery = watch('deliveryMethod');
  useEffect(() => {
    const method = deliveryOptions.find(m => m.id === selectedDelivery);
    if (method) {
      setDeliveryPrice(method.price);
    }
  }, [selectedDelivery]);

  // Рассчитываем итоги
  const subtotal = getTotal();
  const loyaltyDiscount = useLoyaltyDiscount ? (loyalty?.discount || 0) : 0;
  const discountAmount = subtotal * (loyaltyDiscount / 100);
  const total = Math.max(0, subtotal - discountAmount + deliveryPrice);

  const handleNextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    setCheckoutError('');

    try {
      // Создаем заказ через API
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        })),
        shipping: {
          method: data.deliveryMethod,
          price: deliveryPrice,
          address: {
            city: data.city,
            street: data.street,
            apartment: data.apartment,
            postalCode: data.postalCode
          }
        },
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone
        },
        payment: {
          method: data.paymentMethod,
          total: total
        },
        discount: useLoyaltyDiscount ? {
          type: 'loyalty',
          amount: discountAmount,
          percent: loyaltyDiscount
        } : null,
        comment: data.comment
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        // Очищаем корзину
        localStorage.removeItem('cart');
        
        // Перенаправляем на страницу успеха
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        throw new Error(result.error || 'Ошибка при создании заказа');
      }
    } catch (error: any) {
      setCheckoutError(error.message || 'Произошла ошибка. Попробуйте еще раз.');
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Если корзина пуста
  if (items.length === 0 && !authLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
            <p className="text-gray-600 mb-8">
              Добавьте товары в корзину, чтобы оформить заказ
            </p>
            <Button onClick={() => router.push('/catalog')}>
              Перейти в каталог
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Прогресс */}
          <CheckoutProgress currentStep={step} />

          {checkoutError && (
            <div className="mt-6 rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{checkoutError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handlePlaceOrder)}>
            <div className="grid lg:grid-cols-3 gap-8 mt-8">
              {/* Левая колонка - форма */}
              <div className="lg:col-span-2">
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Контактная информация */}
                    <div className="bg-white rounded-xl border p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Контактная информация</h2>
                          <p className="text-gray-600 text-sm">
                            Заполните данные для связи и доставки
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Имя *
                          </label>
                          <Input
                            {...register('firstName')}
                            error={errors.firstName?.message}
                            leftIcon={<User className="h-5 w-5 text-gray-400" />}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Фамилия *
                          </label>
                          <Input
                            {...register('lastName')}
                            error={errors.lastName?.message}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Телефон *
                          </label>
                          <Input
                            type="tel"
                            {...register('phone')}
                            error={errors.phone?.message}
                            leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                            placeholder="+7 (999) 999-99-99"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Адрес доставки */}
                    <div className="bg-white rounded-xl border p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Адрес доставки</h2>
                          <p className="text-gray-600 text-sm">
                            Укажите адрес для отправки заказа
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Город *
                          </label>
                          <Input
                            {...register('city')}
                            error={errors.city?.message}
                            placeholder="Москва"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Улица, дом *
                            </label>
                            <Input
                              {...register('street')}
                              error={errors.street?.message}
                              placeholder="ул. Примерная, д. 123"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Квартира/офис
                            </label>
                            <Input
                              {...register('apartment')}
                              error={errors.apartment?.message}
                              placeholder="12"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Почтовый индекс *
                          </label>
                          <Input
                            {...register('postalCode')}
                            error={errors.postalCode?.message}
                            placeholder="123456"
                          />
                        </div>

                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="saveAddress"
                            {...register('saveAddress')}
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-600">
                            Сохранить этот адрес для будущих заказов
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Кнопка дальше */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        disabled={!isValid}
                        className="px-8"
                      >
                        Продолжить
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Метод доставки */}
                    <div className="bg-white rounded-xl border p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Способ доставки</h2>
                          <p className="text-gray-600 text-sm">
                            Выберите удобный способ получения заказа
                          </p>
                        </div>
                      </div>

                      <DeliveryMethods
                        options={deliveryOptions}
                        selected={watch('deliveryMethod')}
                        onSelect={(method) => setValue('deliveryMethod', method)}
                      />
                    </div>

                    {/* Метод оплаты */}
                    <div className="bg-white rounded-xl border p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Способ оплаты</h2>
                          <p className="text-gray-600 text-sm">
                            Выберите способ оплаты заказа
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {paymentOptions.map((option) => (
                          <div
                            key={option.id}
                            className={`border rounded-xl p-4 cursor-pointer transition-all ${
                              watch('paymentMethod') === option.id
                                ? 'border-black bg-black/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setValue('paymentMethod', option.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <option.icon className="h-5 w-5 text-gray-600" />
                                <div>
                                  <div className="font-medium">{option.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                              {watch('paymentMethod') === option.id && (
                                <Check className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            {option.recommended && (
                              <div className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Рекомендуем
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Комментарий */}
                    <div className="bg-white rounded-xl border p-6">
                      <h3 className="font-semibold mb-4">Комментарий к заказу</h3>
                      <textarea
                        {...register('comment')}
                        className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:border-black focus:outline-none"
                        placeholder="Укажите дополнительные пожелания или детали доставки..."
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Максимум 500 символов
                      </p>
                    </div>

                    {/* Кнопки навигации */}
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                      >
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Назад
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8"
                      >
                        Продолжить
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    {/* Подтверждение заказа */}
                    <div className="bg-white rounded-xl border p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <Lock className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Подтверждение заказа</h2>
                          <p className="text-gray-600 text-sm">
                            Проверьте данные перед оплатой
                          </p>
                        </div>
                      </div>

                      {/* Контактные данные */}
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Контактные данные</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Имя и фамилия</div>
                              <div className="font-medium">
                                {watch('firstName')} {watch('lastName')}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Email</div>
                              <div className="font-medium">{watch('email')}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Телефон</div>
                              <div className="font-medium">{watch('phone')}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Способ оплаты</div>
                              <div className="font-medium">
                                {paymentOptions.find(p => p.id === watch('paymentMethod'))?.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Адрес доставки */}
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Адрес доставки</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <div className="font-medium">
                                {watch('city')}, {watch('street')}{watch('apartment') ? `, кв. ${watch('apartment')}` : ''}
                              </div>
                              <div className="text-gray-600">
                                Почтовый индекс: {watch('postalCode')}
                              </div>
                              <div className="mt-2">
                                <div className="text-sm text-gray-600">Способ доставки:</div>
                                <div className="font-medium">
                                  {deliveryOptions.find(d => d.id === watch('deliveryMethod'))?.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Лояльность */}
                      {loyalty && loyalty.discount > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold mb-3">Программа лояльности</h3>
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium mb-1">
                                  Ваша скидка: {loyalty.discount}%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Уровень: {loyalty.level}
                                </div>
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={useLoyaltyDiscount}
                                  onChange={(e) => setUseLoyaltyDiscount(e.target.checked)}
                                  className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <span className="font-medium">
                                  Использовать скидку {loyalty.discount}%
                                </span>
                              </label>
                            </div>
                            {useLoyaltyDiscount && (
                              <div className="mt-3 p-3 bg-white rounded border">
                                <div className="flex items-center justify-between">
                                  <span>Сумма скидки:</span>
                                  <span className="font-bold text-green-600">
                                    -{formatPrice(discountAmount)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Комментарий */}
                      {watch('comment') && (
                        <div className="mb-6">
                          <h3 className="font-semibold mb-3">Комментарий</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">{watch('comment')}</p>
                          </div>
                        </div>
                      )}

                      {/* Согласие */}
                      <div className="mt-6 p-4 border rounded-lg">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            required
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <div className="text-sm text-gray-600">
                            Я соглашаюсь с условиями{' '}
                            <a href="/terms" className="text-black hover:underline">
                              пользовательского соглашения
                            </a>{' '}
                            и даю согласие на обработку персональных данных в соответствии с{' '}
                            <a href="/privacy" className="text-black hover:underline">
                              политикой конфиденциальности
                            </a>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Кнопки навигации */}
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                      >
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Назад
                      </Button>
                      <Button
                        type="submit"
                        loading={isProcessing}
                        disabled={isProcessing}
                        className="px-12"
                      >
                        <Lock className="h-5 w-5 mr-2" />
                        Оплатить {formatPrice(total)}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Правая колонка - итог */}
              <div className="lg:col-span-1">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  discount={discountAmount}
                  shipping={deliveryPrice}
                  loyaltyDiscount={loyaltyDiscount}
                  total={total}
                  currentStep={step}
                  onStepChange={setStep}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}