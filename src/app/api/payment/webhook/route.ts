import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest('hex');

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        const signatureValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

        if (!signatureValid) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);

        // Handle payment success
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const userId = payment.notes?.userId as string | undefined;
            const productType = (payment.notes?.productType || payment.notes?.productKey) as string | undefined;

            if (!userId || !productType) {
                return NextResponse.json(
                    { error: 'Missing payment metadata' },
                    { status: 400 }
                );
            }

            // Create credit pack or mark question as paid
            if (productType === 'CREDIT_PACK_5' || productType === 'CREDIT_PACK_10' || productType === 'SINGLE_QUESTION') {
                let questionsTotal = 1;
                if (productType === 'CREDIT_PACK_5') questionsTotal = 5;
                if (productType === 'CREDIT_PACK_10') questionsTotal = 10;

                // Idempotency check
                const existingPack = await prisma.creditPack.findFirst({
                    where: { paymentId: payment.id }
                });

                if (existingPack) {
                    return NextResponse.json({ success: true, note: 'Duplicate' });
                }

                await prisma.$transaction([
                    prisma.creditPack.create({
                        data: {
                            userId,
                            packType: productType,
                            questionsTotal,
                            questionsUsed: 0,
                            paymentId: payment.id,
                            amount: payment.amount,
                        },
                    }),
                    prisma.creditTransaction.create({
                        data: {
                            userId,
                            amount: questionsTotal,
                            description: `Purchased ${questionsTotal} credit${questionsTotal > 1 ? 's' : ''} via Razorpay`,
                            metadata: {
                                paymentId: payment.id,
                                productType,
                                razorpayOrderId: payment.order_id || null
                            }
                        }
                    })
                ]);
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Payment webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
