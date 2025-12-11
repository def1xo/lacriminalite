import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { LoyaltyProvider } from '@/providers/LoyaltyProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { getInitialCart } from '@/lib/actions/cart';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'La Criminalite | Официальный магазин',
    template: '%s | La Criminalite',
  },
  description: 'Официальный интернет-магазин одежды La Criminalite. LIMITED и REGULAR коллекции, эксклюзивные модели, худи, футболки, аксессуары.',
  keywords: ['La Criminalite', 'одежда', 'streetwear', 'худи', 'футболки', 'LIMITED', 'REGULAR', 'кроссовки', 'аксессуары'],
  authors: [{ name: 'La Criminalite' }],
  creator: 'La Criminalite',
  publisher: 'La Criminalite',
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
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://lacriminalite.ru',
    siteName: 'La Criminalite',
    title: 'La Criminalite | Официальный магазин',
    description: 'Официальный интернет-магазин одежды La Criminalite',
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
    images: ['/images/og-image.jpg'],
    creator: '@lacriminalite',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'fashion',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
  modal?: React.ReactNode;
}

export default async function RootLayout({ children, modal }: RootLayoutProps) {
  const cookieStore = await cookies();
  const initialCart = await getInitialCart(cookieStore);
  
  return (
    <html lang="ru" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="preconnect" href="https://yookassa.ru" />
        <link rel="preconnect" href="https://api.cdek.ru" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://yookassa.ru" />
        <link rel="dns-prefetch" href="https://api.cdek.ru" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CartProvider initialCart={initialCart}>
              <LoyaltyProvider>
                {children}
                {modal}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    classNames: {
                      toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                      description: 'group-[.toast]:text-muted-foreground',
                      actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                      cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                    },
                  }}
                />
                <div id="modal-root" />
                <div id="cart-sidebar" />
              </LoyaltyProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>

        {/* External Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Yandex Metrika */}
            <Script
              id="yandex-metrika"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
                  ym(00000000, "init", {
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,
                    webvisor:true,
                    ecommerce:"dataLayer"
                  });
                `,
              }}
            />
            <noscript>
              <div>
                <img
                  src="https://mc.yandex.ru/watch/00000000"
                  style={{ position: 'absolute', left: '-9999px' }}
                  alt=""
                />
              </div>
            </noscript>

            {/* Google Analytics */}
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XXXXXXXXXX');
              `}
            </Script>

            {/* VK Pixel */}
            <Script
              id="vk-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(){var t=document.createElement("script");
                  t.type="text/javascript",t.async=!0,t.src="https://vk.com/js/api/openapi.js?169";
                  t.onload=function(){VK.Retargeting.Init("VK-RTRG-XXXXXX-XXXX"),VK.Retargeting.Hit()},
                  document.head.appendChild(t)}();
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}