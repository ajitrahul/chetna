import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { generateClarityResponse, isQuestionSafe } from '@/lib/ai/geminiService';
import { ChartData } from '@/lib/astrology/calculator';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to ask questions.' },
                { status: 401 }
            );
        }

        const { question } = await req.json();

        if (!question || question.trim().length < 10) {
            return NextResponse.json(
                { error: 'Please provide a meaningful question (at least 10 characters)' },
                { status: 400 }
            );
        }

        // Safety check
        const safetyCheck = isQuestionSafe(question);
        if (!safetyCheck.safe) {
            return NextResponse.json(
                {
                    error: 'Question not allowed',
                    reason: safetyCheck.reason,
                    reframe: 'Please rephrase your question to focus on patterns and awareness rather than predictions or medical/financial advice.'
                },
                { status: 400 }
            );
        }

        // Check if user has credits
        // Get cost for asking a question from DB
        const serviceCost = await prisma.serviceCost.findUnique({
            where: { key: 'ASK_QUESTION' }
        });

        const creditsRequired = serviceCost?.credits || 1; // Default to 1 if not set

        const creditPack = await prisma.creditPack.findFirst({
            where: {
                userId: session.user.id,
                questionsUsed: {
                    lte: prisma.creditPack.fields.questionsTotal // Need strictly less than total minus required? No, checks logic below
                },
            },
            orderBy: {
                purchasedAt: 'asc',
            },
        });

        // Simpler check: Calculate total available credits across all packs
        const allPacks = await prisma.creditPack.findMany({
            where: { userId: session.user.id }
        });

        const totalCreditsAvailable = allPacks.reduce((acc, pack) => acc + (pack.questionsTotal - pack.questionsUsed), 0);

        if (totalCreditsAvailable < creditsRequired) {
            return NextResponse.json(
                {
                    error: `Insufficient credits. This requires ${creditsRequired} credits.`,
                    message: 'Please purchase more credits to ask questions',
                    redirectTo: '/pricing'
                },
                { status: 402 }
            );
        }

        // Logic to deduct credits from packs (FIFO)
        let creditsToDeduct = creditsRequired;
        const packsToUpdate = [];

        // Sort packs by purchase date to use oldest first
        const sortedPacks = allPacks
            .filter(p => p.questionsTotal > p.questionsUsed)
            .sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime());

        for (const pack of sortedPacks) {
            if (creditsToDeduct <= 0) break;

            const availableInPack = pack.questionsTotal - pack.questionsUsed;
            const takeFromPack = Math.min(availableInPack, creditsToDeduct);

            packsToUpdate.push({ id: pack.id, increment: takeFromPack });
            creditsToDeduct -= takeFromPack;
        }

        if (creditsToDeduct > 0) {
            // Should not happen due to check above
            return NextResponse.json({ error: 'Credit calculation error' }, { status: 500 });
        }

        // Get user's most recent chart data
        const profile = await prisma.profile.findFirst({
            where: {
                userId: session.user.id,
                isActive: true
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!profile) {
            return NextResponse.json(
                {
                    error: 'No chart data found',
                    message: 'Please create your birth chart first',
                    redirectTo: '/chart'
                },
                { status: 400 }
            );
        }

        // Generate AI response using Gemini
        const aiResponse = await generateClarityResponse(
            question,
            profile.chartData as unknown as ChartData
        );

        // Deduct credits transactionally
        await prisma.$transaction(
            packsToUpdate.map(p =>
                prisma.creditPack.update({
                    where: { id: p.id },
                    data: { questionsUsed: { increment: p.increment } }
                })
            )
        );

        // Save question and response to database
        const savedQuestion = await prisma.question.create({
            data: {
                userId: session.user.id,
                questionText: question,
                response: aiResponse as unknown as Prisma.InputJsonValue,
                chartSnapshot: profile.chartData as unknown as Prisma.InputJsonValue,
                isPaid: true,
            },
        });

        const remainingCredits = totalCreditsAvailable - creditsRequired;

        return NextResponse.json({
            success: true,
            response: aiResponse,
            remainingCredits,
            questionId: savedQuestion.id,
        });

    } catch (error) {
        console.error('Clarity API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response. Please try again.' },
            { status: 500 }
        );
    }
}
