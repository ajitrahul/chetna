import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ask Chetna AI | Reflective Astrology Q&A',
    description: 'Ask Chetna AI about your life patterns, relationships, and timing. Get a structured, reflection-first reading from your Vedic birth chart — awareness, not prediction.',
};

export default function ClarityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
