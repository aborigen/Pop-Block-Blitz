import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Pop Block Blitz',
  description: 'A satisfying hypercasual block popping game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://yandex.ru/games/sdk/v2" 
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
