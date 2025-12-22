import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateClarityResponse, isQuestionSafe } from '@/lib/ai/geminiService';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
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
        const creditPack = await prisma.creditPack.findFirst({
            where: {
                userId: session.user.id,
                questionsUsed: {
                    lt: prisma.creditPack.fields.questionsTotal,
                },
            },
            orderBy: {
                purchasedAt: 'asc',
            },
        });

        if (!creditPack) {
            return NextResponse.json(
                {
                    error: 'No credits available',
                    message: 'Please purchase credits to ask questions',
                    redirectTo: '/pricing'
                },
                { status: 402 }
            );
        }

        // Get user's most recent chart data
        const profile = await prisma.profile.findFirst({
            where: { userId: session.user.id },
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
            profile.chartData
        );

        // Deduct credit
        await prisma.creditPack.update({
            where: { id: creditPack.id },
            data: {
                questionsUsed: {
                    increment: 1,
                },
            },
        });

        // Save question and response to database
        const savedQuestion = await prisma.question.create({
            data: {
                userId: session.user.id,
                questionText: question,
                response: aiResponse as any,
                chartSnapshot: profile.chartData,
                isPaid: true,
            },
        });

        const remainingCredits = creditPack.questionsTotal - creditPack.questionsUsed - 1;

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
