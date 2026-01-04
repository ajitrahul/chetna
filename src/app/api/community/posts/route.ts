import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

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
        const { content, topicId } = body;

        if (!content || !topicId) {
            return NextResponse.json(
                { error: 'Content and topicId are required' },
                { status: 400 }
            );
        }

        const post = await (prisma as any).post.create({
            data: {
                content,
                topicId,
                userId: session.user.id
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('Failed to create post:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
