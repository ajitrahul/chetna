'use client';

import { Suspense } from 'react';
import ClarityPageContent from '@/components/ClarityPageContent';

export default function ClarityPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading cosmic clarity...</div>}>
            <ClarityPageContent />
        </Suspense>
    );
}
