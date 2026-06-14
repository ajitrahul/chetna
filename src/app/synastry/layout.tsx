import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Relationship Compatibility & Synastry | AskChetna',
    description: 'Compare two charts and understand your relationship through patterns, not scores. See communication style, emotional needs, and what the connection is here to teach you.',
};

export default function SynastryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
