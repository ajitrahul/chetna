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

        if (signature !== expectedSignature) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);

        // Handle payment success
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const userId = payment.notes.userId;
            const productType = payment.notes.productType;

            // Create credit pack or mark question as paid
            if (productType === 'CREDIT_PACK_5' || productType === 'CREDIT_PACK_10') {
                const questionsTotal = productType === 'CREDIT_PACK_5' ? 5 : 10;

                await prisma.creditPack.create({
                    data: {
                        userId,
                        packType: productType,
                        questionsTotal,
                        questionsUsed: 0,
                        paymentId: payment.id,
                        amount: payment.amount,
                    },
                });
            } else if (productType === 'SINGLE_QUESTION') {
                // Mark question as paid (implement when question is created)
                // This will be handled in the clarity API endpoint
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
