'use client';

import { Suspense } from 'react';
import ChartPageContent from '@/components/ChartPageContent';

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
