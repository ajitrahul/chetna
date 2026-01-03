
import PricingClient from '@/components/PricingClient';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
    const plans = await prisma.pricingPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    return <PricingClient plans={plans} />;
}
