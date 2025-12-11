'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Mail,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Логирование ошибки
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Отправка в аналитику
    if (typeof window !== 'undefined' && (window as any).ym) {
      (window as any).ym(00000000, 'reachGoal', 'app_error', {
        error: error.message,
        digest: error.digest,
        url: window.location.pathname,
      });
    }

    // Отправка в Sentry или другую систему мониторинга
    if (process.env.NODE_ENV === 'production') {
      // Здесь будет интеграция с Sentry
      // captureException(error);
    }
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleReportError = () => {
    const subject = `Ошибка на сайте La Criminalite: ${error.message.substring(0, 50)}...`;
    const body = `
Ошибка произошла на странице: ${window.location.href}

Сообщение об ошибке:
${error.message}

Стек вызовов:
${error.stack || 'Недоступно'}

Digest: ${error.digest || 'Недоступно'}

Информация о браузере:
${navigator.userAgent}

Дополнительные детали:
(опишите, что вы делали перед ошибкой)
    `.trim();

    window.location.href = `mailto:dev@lacriminalite.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-bold mb-4">
                КРИТИЧЕСКАЯ ОШИБКА
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Что-то пошло не так
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Произошла непредвиденная ошибка. Мы уже работаем над ее устранением.
            </p>
          </div>

          {/* Детали ошибки (только для разработки) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bug className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Детали ошибки (только для разработки)</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-red-700 font-medium">Сообщение:</div>
                  <div className="font-mono text-sm bg-white p-3 rounded border">
                    {error.message}
                  </div>
                </div>
                {error.stack && (
                  <div>
                    <div className="text-sm text-red-700 font-medium">Стек вызовов:</div>
                    <pre className="font-mono text-xs bg-white p-3 rounded border overflow-auto max-h-60">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {error.digest && (
                  <div>
                    <div className="text-sm text-red-700 font-medium">Digest:</div>
                    <div className="font-mono text-sm bg-white p-3 rounded border">
                      {error.digest}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Попробовать снова</h3>
              <p className="text-sm text-gray-600 mb-4">
                Перезагрузить страницу и повторить действие
              </p>
              <Button onClick={handleReset} className="w-full">
                Повторить
              </Button>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">На главную</h3>
              <p className="text-sm text-gray-600 mb-4">
                Вернуться на главную страницу
              </p>
              <Button onClick={handleGoHome} className="w-full">
                Перейти
              </Button>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Обновить</h3>
              <p className="text-sm text-gray-600 mb-4">
                Полностью обновить страницу
              </p>
              <Button onClick={handleRefresh} variant="outline" className="w-full">
                Обновить
              </Button>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Сообщить об ошибке</h3>
              <p className="text-sm text-gray-600 mb-4">
                Помогите нам улучшить сайт
              </p>
              <Button onClick={handleReportError} variant="outline" className="w-full">
                Сообщить
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-8 mb-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Нужна срочная помощь?</h2>
              <p className="text-gray-300 mb-6">
                Наша техническая поддержка работает 24/7 и поможет решить вашу проблему
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://t.me/lacriminalite_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  💬 Онлайн-чат в Telegram
                </a>
                <a
                  href="tel:+78001234567"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-black transition-colors"
                >
                  📞 Бесплатный звонок
                </a>
              </div>
            </div>
          </div>

          {/* Что могло вызвать ошибку */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Возможные причины</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Проблемы с соединением
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Нестабильное интернет-соединение</li>
                  <li>• Проблемы с DNS</li>
                  <li>• Блокировка брандмауэром</li>
                  <li>• Устаревший кэш браузера</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Технические работы
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Обновление системы</li>
                  <li>• Техническое обслуживание</li>
                  <li>• Временные неполадки</li>
                  <li>• Высокая нагрузка на сервер</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Инструкция по устранению */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold mb-3 text-blue-800">Как исправить самостоятельно?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-blue-700">1. Очистить кэш</div>
                <p className="text-sm text-blue-600">
                  Нажмите Ctrl + Shift + R (Windows) или Cmd + Shift + R (Mac)
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-blue-700">2. Проверить соединение</div>
                <p className="text-sm text-blue-600">
                  Убедитесь, что интернет работает стабильно
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-blue-700">3. Обновить браузер</div>
                <p className="text-sm text-blue-600">
                  Используйте последнюю версию браузера
                </p>
              </div>
            </div>
          </div>

          {/* Статус системы */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Проверить статус системы можно на{' '}
              <a 
                href="https://status.lacriminalite.ru" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline font-medium"
              >
                status.lacriminalite.ru
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}