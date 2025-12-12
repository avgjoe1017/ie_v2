import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { CallDialog } from '@/components/CallDialog';
import { Notification } from '@/components/Notification';
import { OfflineDetector } from '@/components/OfflineDetector';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'IE Call List',
  description: 'Inside Edition Station Contact Directory',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IE Call List',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f9fafb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-128x128.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-128x128.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-96x96.svg" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
      >
        <Providers>
          <div id="page">
            <OfflineDetector />
            {children}
            <CallDialog />
            <Notification />
          </div>
        </Providers>
      </body>
    </html>
  );
}
