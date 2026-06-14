import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import WelcomeBanner from '@/components/WelcomeBanner';
import prisma from '@/lib/prisma';

import AnalyticsTracker from '@/components/AnalyticsTracker';
import FloatingActionButton from '@/components/FloatingActionButton';
import AskChetnaFab from '@/components/AskChetnaFab';
import { ProfileProvider } from '@/context/ProfileContext';
import ProfileManager from '@/components/ProfileManager';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-main',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AskChetna | Astrology for Awareness',
  description: 'Understand patterns, not predictions. A calm, awareness-first approach to Vedic Astrology and planetary timing.',
  keywords: ['vedic astrology', 'astrology for awareness', 'vimsottari dasha', 'panchang', 'self-reflection', 'ai astrology'],
  openGraph: {
    title: 'AskChetna | Astrology for Awareness',
    description: 'Understand patterns, not predictions. A deep, psychological approach to Vedic Astrology.',
    url: 'https://chetna.ai',
    siteName: 'AskChetna',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskChetna | Astrology for Awareness',
    description: 'Understand patterns, not predictions.',
  },
  icons: {
    icon: '/icons/chetna.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let welcomeBonusAmount = 10;
  try {
    const welcomeBonusSetting = await prisma.serviceCost.findUnique({
      where: { key: 'WELCOME_BONUS' }
    });
    if (welcomeBonusSetting) {
      welcomeBonusAmount = welcomeBonusSetting.credits;
    }
  } catch (error) {
    console.error('Failed to fetch welcome bonus amount:', error);
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AskChetna',
    url: 'https://askchetna.com',
    description: 'Understand patterns, not predictions. An awareness-first approach to Vedic Astrology and planetary timing.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://askchetna.com/clarity?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <div className="cosmic-bg-overlay"></div>
        <div className="stars-layer-1"></div>
        <div className="stars-layer-2"></div>
        <div className="central-portal-glow"></div>
        <div className="noise-overlay"></div>
        <AuthProvider>
          <ProfileProvider>
            <Header />
            <WelcomeBanner bonusAmount={welcomeBonusAmount} />
            <main style={{ paddingTop: '20px' }}>
              {children}
            </main>
            <Footer />

            <ProfileManager />
            <FloatingActionButton />
            <AskChetnaFab />
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
