import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing & Credits | AskChetna',
    description: 'Simple, transparent credits for AskChetna. Start with 10 free credits on signup, then top up Clarity packs as you need them — they never expire.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
