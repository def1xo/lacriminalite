'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useAuth } from '@/hooks/useAuth';

const passwordRequirements = [
  { id: 'length', label: 'Не менее 8 символов' },
  { id: 'uppercase', label: 'Заглавная буква' },
  { id: 'number', label: 'Цифра' },
  { id: 'special', label: 'Специальный символ' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    // Пароль
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Пароль должен быть не менее 8 символов';
      }
      if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Пароль должен содержать заглавную букву';
      }
      if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Пароль должен содержать цифру';
      }
      if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
        newErrors.password = 'Пароль должен содержать специальный символ';
      }
    }

    // Подтверждение пароля
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // Имя
    if (!formData.firstName) {
      newErrors.firstName = 'Введите имя';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Имя должно быть не менее 2 символов';
    }

    // Телефон
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    // Соглашение
    if (!agreedToTerms) {
      newErrors.terms = 'Необходимо согласиться с условиями';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Форматирование номера телефона
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 0) {
      formatted = '+7 ';
      if (cleaned.length > 1) {
        formatted += `(${cleaned.slice(1, 4)}`;
      }
      if (cleaned.length >= 5) {
        formatted += `) ${cleaned.slice(4, 7)}`;
      }
      if (cleaned.length >= 8) {
        formatted += `-${cleaned.slice(7, 9)}`;
      }
      if (cleaned.length >= 10) {
        formatted += `-${cleaned.slice(9, 11)}`;
      }
    }
    
    handleChange('phone')(formatted);
  };

  const checkPasswordRequirement = (id: string) => {
    switch (id) {
      case 'length':
        return formData.password.length >= 8;
      case 'uppercase':
        return /(?=.*[A-Z])/.test(formData.password);
      case 'number':
        return /(?=.*\d)/.test(formData.password);
      case 'special':
        return /(?=.*[!@#$%^&*])/.test(formData.password);
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) return;

    try {
      const success = await register(formData);
      if (success) {
        // Перенаправляем на страницу подтверждения или профиль
        router.push('/profile');
        router.refresh();
      } else {
        setGeneralError('Ошибка при регистрации. Возможно, email уже используется.');
      }
    } catch (error: any) {
      if (error.message.includes('email')) {
        setErrors((prev) => ({ ...prev, email: 'Этот email уже используется' }));
      } else {
        setGeneralError('Произошла ошибка при регистрации');
      }
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
        <p className="text-gray-600">
          Создайте аккаунт, чтобы получить доступ ко всем возможностям
        </p>
      </div>

      {/* Форма регистрации */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {generalError && (
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{generalError}</span>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
              Имя
            </label>
            <Input
              id="firstName"
              placeholder="Иван"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName')(e.target.value)}
              error={errors.firstName}
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
              Фамилия
            </label>
            <Input
              id="lastName"
              placeholder="Иванов"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName')(e.target.value)}
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email')(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
            Телефон (необязательно)
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+7 (999) 999-99-99"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password')(e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            disabled={isLoading}
          />
          
          {/* Требования к паролю */}
          <div className="mt-3 space-y-2">
            {passwordRequirements.map((req) => {
              const isMet = checkPasswordRequirement(req.id);
              return (
                <div key={req.id} className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      isMet ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {isMet ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isMet ? 'text-green-700' : 'text-gray-500'
                    }`}
                  >
                    {req.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
            Подтверждение пароля
          </label>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword')(e.target.value)}
            error={errors.confirmPassword}
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: '' }));
                }
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              Я соглашаюсь с{' '}
              <Link href="/terms" className="text-black hover:underline">
                пользовательским соглашением
              </Link>{' '}
              и{' '}
              <Link href="/privacy" className="text-black hover:underline">
                политикой конфиденциальности
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-600">{errors.terms}</p>
          )}

          <div className="flex items-start">
            <input
              id="newsletter"
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
              Я хочу получать информацию о новых коллекциях и специальных предложениях
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Зарегистрироваться
        </Button>
      </form>

      {/* Разделитель */}
      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="mx-4 text-sm text-gray-500">или</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Быстрая регистрация */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => console.log('Register with Google')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Продолжить с Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => console.log('Register with VK')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="#07F">
            <path d="M12.65 16.58c-4.36 0-7.23-3.14-7.5-8.42H8.1c.15 3.21 1.68 4.85 3.24 5.18V8.16h2.93v3.54c1.54-.17 3.14-1.67 3.68-3.54h2.9c-.54 2.75-2.52 4.78-3.84 5.61 1.32.63 3.44 2.25 4.24 5.21h-3.19c-.64-2.06-2.3-3.62-4.31-3.83v3.83h-.35z" />
          </svg>
          Продолжить с VK
        </Button>
      </div>

      {/* Ссылка на вход */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Уже есть аккаунт?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-black hover:text-gray-800"
          >
            Войти
          </Link>
        </p>
      </div>

      {/* Преимущества регистрации */}
      <div className="mt-8 space-y-4 rounded-lg bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Преимущества регистрации:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>История заказов и отслеживание доставки</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Программа лояльности с накопительными скидками</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Быстрое оформление заказов</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Персональные предложения и скидки</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Сохранение адресов доставки</span>
          </li>
        </ul>
      </div>
    </div>
  );
}