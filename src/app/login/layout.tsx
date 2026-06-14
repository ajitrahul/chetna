import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In | AskChetna',
    description: 'Sign in to AskChetna to access your birth chart, Dasha timing, and AI reflection sessions.',
    robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
