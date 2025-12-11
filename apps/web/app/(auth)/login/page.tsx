'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!password) {
      newErrors.password = 'Введите пароль';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) return;

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/profile');
        router.refresh();
      } else {
        setGeneralError('Неверный email или пароль');
      }
    } catch (error) {
      setGeneralError('Произошла ошибка при входе');
      console.error('Login error:', error);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'vk' | 'yandex') => {
    // Здесь будет логика социальной авторизации
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Вход в аккаунт</h1>
        <p className="text-gray-600">
          Войдите в свой аккаунт, чтобы продолжить покупки
        </p>
      </div>

      {/* Форма входа */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {generalError && (
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{generalError}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Запомнить меня
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-red-600 hover:text-red-800"
            >
              Забыли пароль?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Войти
        </Button>
      </form>

      {/* Разделитель */}
      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="mx-4 text-sm text-gray-500">или</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Социальные сети */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Продолжить с Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('vk')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="#07F">
            <path d="M12.65 16.58c-4.36 0-7.23-3.14-7.5-8.42H8.1c.15 3.21 1.68 4.85 3.24 5.18V8.16h2.93v3.54c1.54-.17 3.14-1.67 3.68-3.54h2.9c-.54 2.75-2.52 4.78-3.84 5.61 1.32.63 3.44 2.25 4.24 5.21h-3.19c-.64-2.06-2.3-3.62-4.31-3.83v3.83h-.35z" />
          </svg>
          Продолжить с VK
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('yandex')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="red">
            <path d="M12 1L1 12.5l4.5 4.5L12 7.5l6.5 9.5 4.5-4.5L12 1z" />
          </svg>
          Продолжить с Яндекс
        </Button>
      </div>

      {/* Ссылка на регистрацию */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Нет аккаунта?{' '}
          <Link
            href="/auth/register"
            className="font-semibold text-black hover:text-gray-800"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-8 rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Регистрируясь, вы соглашаетесь с{' '}
          <Link href="/terms" className="text-black hover:underline">
            пользовательским соглашением
          </Link>{' '}
          и{' '}
          <Link href="/privacy" className="text-black hover:underline">
            политикой конфиденциальности
          </Link>
          .
        </p>
      </div>
    </div>
  );
}