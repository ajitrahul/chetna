
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ClarityPageContent = dynamic(() => import('@/components/ClarityPageContent'), { ssr: false });

export default function ClarityPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading cosmic clarity...</div>}>
            <ClarityPageContent />
        </Suspense>
    );
}
