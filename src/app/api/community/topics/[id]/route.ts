import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const topic = await (prisma as any).topic.findUnique({
            where: { id },
            include: {
                user: {
                    select: { name: true, image: true }
                },
                posts: {
                    include: {
                        user: {
                            select: { name: true, image: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(topic);
    } catch (error) {
        console.error('Failed to fetch topic details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch topic details' },
            { status: 500 }
        );
    }
}
