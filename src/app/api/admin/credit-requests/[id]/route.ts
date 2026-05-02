import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/admin';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type ReviewAction = 'APPROVE' | 'REJECT';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const adminEmail = session?.user?.email || null;
    const adminAllowed = await isAdmin(adminEmail);

    if (!adminAllowed) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const action = typeof body?.action === 'string' ? body.action.toUpperCase() : '';
        const adminNote = typeof body?.adminNote === 'string' ? body.adminNote.trim() : '';

        if (action !== 'APPROVE' && action !== 'REJECT') {
            return NextResponse.json(
                { error: 'Action must be APPROVE or REJECT.' },
                { status: 400 }
            );
        }

        if (adminNote.length > 1000) {
            return NextResponse.json(
                { error: 'Admin note is too long. Keep it under 1000 characters.' },
                { status: 400 }
            );
        }

        const updatedRequest = await prisma.$transaction(async (tx) => {
            const existingRequest = await tx.creditRequest.findUnique({
                where: { id }
            });

            if (!existingRequest) {
                throw new Error('REQUEST_NOT_FOUND');
            }

            if (existingRequest.status !== 'PENDING') {
                throw new Error('REQUEST_ALREADY_REVIEWED');
            }

            const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
            const reviewUpdate = await tx.creditRequest.updateMany({
                where: {
                    id,
                    status: 'PENDING'
                },
                data: {
                    status: nextStatus,
                    adminNote: adminNote || null,
                    reviewedBy: adminEmail,
                    reviewedAt: new Date()
                }
            });

            if (reviewUpdate.count === 0) {
                throw new Error('REQUEST_ALREADY_REVIEWED');
            }

            if (action === 'APPROVE') {
                await tx.creditPack.create({
                    data: {
                        userId: existingRequest.userId,
                        packType: 'ADMIN_APPROVED_REQUEST',
                        questionsTotal: existingRequest.requestedCredits,
                        questionsUsed: 0,
                        paymentId: `ADMIN_CREDIT_REQUEST_${existingRequest.id}`,
                        amount: 0
                    }
                });

                await tx.creditTransaction.create({
                    data: {
                        userId: existingRequest.userId,
                        amount: existingRequest.requestedCredits,
                        description: `Admin approved ${existingRequest.requestedCredits} credits`,
                        metadata: {
                            source: 'admin_credit_request_approval',
                            creditRequestId: existingRequest.id,
                            reviewedBy: adminEmail
                        }
                    }
                });
            }

            return tx.creditRequest.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
        });

        const actionVerb = (action as ReviewAction) === 'APPROVE' ? 'approved' : 'rejected';
        return NextResponse.json({
            success: true,
            message: `Credit request ${actionVerb} successfully.`,
            request: updatedRequest
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
            return NextResponse.json(
                { error: 'Credit requests feature is not available yet. Please run Prisma schema sync.' },
                { status: 503 }
            );
        }

        if (error instanceof Error && error.message === 'REQUEST_NOT_FOUND') {
            return NextResponse.json({ error: 'Credit request not found.' }, { status: 404 });
        }
        if (error instanceof Error && error.message === 'REQUEST_ALREADY_REVIEWED') {
            return NextResponse.json(
                { error: 'This credit request has already been reviewed.' },
                { status: 409 }
            );
        }

        console.error('Admin credit request review error:', error);
        return NextResponse.json({ error: 'Failed to review credit request' }, { status: 500 });
    }
}
