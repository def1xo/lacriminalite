import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import CartSidebar from '@/components/cart/CartSidebar/CartSidebar';
import { ToastProvider } from '@/components/shared/Toast/Toast';
import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { LoyaltyProvider } from '@/providers/LoyaltyProvider';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: {
    default: 'La Criminalite | Официальный магазин',
    template: '%s | La Criminalite'
  },
  description: 'Официальный интернет-магазин одежды La Criminalite. LIMITED и REGULAR коллекции.',
  keywords: ['одежда', 'La Criminalite', 'streetwear', 'LIMITED', 'REGULAR', 'худи', 'футболки'],
  authors: [{ name: 'La Criminalite' }],
  creator: 'La Criminalite',
  publisher: 'La Criminalite',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lacriminalite.ru'),
  alternates: {
    canonical: '/',
    languages: {
      'ru-RU': '/ru',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://lacriminalite.ru',
    title: 'La Criminalite | Официальный магазин',
    description: 'Официальный интернет-магазин одежды La Criminalite',
    siteName: 'La Criminalite',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'La Criminalite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Criminalite | Официальный магазин',
    description: 'Официальный интернет-магазин одежды La Criminalite',
    images: ['/images/twitter-image.jpg'],
    creator: '@lacriminalite',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.className}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <AuthProvider>
          <CartProvider>
            <LoyaltyProvider>
              <ToastProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <CartSidebar />
                </div>
              </ToastProvider>
            </LoyaltyProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}