
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
const ChartPageContent = dynamic(() => import('@/components/ChartPageContent'), { ssr: false });

export default function ChartPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
        }>
            <ChartPageContent />
        </Suspense>
    );
}
