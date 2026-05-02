
import PricingClient from '@/components/PricingClient';
import prisma from '@/lib/prisma';
import { PAYMENTS_ENABLED, PAYMENTS_PAUSED_MESSAGE } from '@/lib/paymentConfig';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
    if (!PAYMENTS_ENABLED) {
        return (
            <div className={styles.container}>
                <div className={styles.infoSection}>
                    <h1 className="mystic-text text-4xl mb-4">Credit Purchases Paused</h1>
                    <p className={styles.subtitle}>{PAYMENTS_PAUSED_MESSAGE}</p>
                </div>
            </div>
        );
    }

    const plans = await prisma.pricingPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    return <PricingClient plans={plans} />;
}
