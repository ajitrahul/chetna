import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community | AskChetna',
    description: 'Join the AskChetna community — share reflections, ask questions, and explore astrology as a tool for self-awareness alongside other seekers.',
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
