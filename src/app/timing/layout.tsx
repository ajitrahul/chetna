import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dasha Timing & Life Seasons | AskChetna',
    description: 'Understand the season of life you are in. Chetna translates your Vedic Dasha periods into plain-language life themes — what this phase is asking of you, and why.',
};

export default function TimingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
