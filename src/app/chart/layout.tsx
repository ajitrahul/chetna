import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Vedic Birth Chart | AskChetna',
    description: 'See your full Vedic birth chart with plain-English meaning. Explore your Ascendant, planetary placements, and divisional charts as a map for self-awareness.',
};

export default function ChartLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
