import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import '../../styles/globals.css';

export const metadata: Metadata = {
  title: 'Вход и регистрация | La Criminalite',
  description: 'Войдите в аккаунт или зарегистрируйтесь в La Criminalite',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">LA CRIMINALITE</div>
                <div className="h-6 w-px bg-gray-300" />
                <div className="text-sm text-gray-600">Вход / Регистрация</div>
              </div>
            </Link>
            
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад на главную
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-md">{children}</div>
        </div>
      </main>

      {/* Футер */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} La Criminalite. Все права защищены.</p>
            <div className="mt-2">
              <Link href="/privacy" className="hover:text-black">
                Политика конфиденциальности
              </Link>
              {' · '}
              <Link href="/terms" className="hover:text-black">
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}