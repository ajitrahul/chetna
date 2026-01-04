import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const topics = await (prisma as any).topic.findMany({
            include: {
                user: {
                    select: { name: true, image: true }
                },
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(topics);
    } catch (error) {
        console.error('Failed to fetch topics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch topics' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        const topic = await (prisma as any).topic.create({
            data: {
                title,
                content,
                userId: session.user.id
            }
        });

        return NextResponse.json(topic, { status: 201 });
    } catch (error) {
        console.error('Failed to create topic:', error);
        return NextResponse.json(
            { error: 'Failed to create topic' },
            { status: 500 }
        );
    }
}
