import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Montserrat, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import LoginReminder from '@/components/LoginReminder';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-main',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chetna | Astrology for Awareness',
  description: 'Understand patterns, not predictions. A calm, awareness-first approach to Vedic Astrology and planetary timing.',
  keywords: ['vedic astrology', 'astrology for awareness', 'vimsottari dasha', 'panchang', 'self-reflection', 'ai astrology'],
  openGraph: {
    title: 'Chetna | Astrology for Awareness',
    description: 'Understand patterns, not predictions. A deep, psychological approach to Vedic Astrology.',
    url: 'https://chetna.ai',
    siteName: 'Chetna',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chetna | Astrology for Awareness',
    description: 'Understand patterns, not predictions.',
  },
  icons: {
    icon: '/icons/chetna.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${cormorant.variable}`}>
        <AuthProvider>
          <Header />
          <main style={{ paddingTop: '20px' }}>
            {children}
          </main>
          <Footer />
          <LoginReminder />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
