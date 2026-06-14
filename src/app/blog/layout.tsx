import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | Vedic Astrology in Plain English | AskChetna',
    description: 'Clear, beginner-friendly articles on Vedic astrology — Dasha periods, Rahu & Ketu, Saturn returns, Ascendants, and more. Understand the patterns, skip the fear.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
