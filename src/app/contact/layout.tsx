import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact AskChetna | We\'re Here to Help',
    description: 'Questions, feedback, or support? Get in touch with the AskChetna team — we read and reply to every message.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
