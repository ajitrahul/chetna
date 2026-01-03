import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const transactions = await prisma.creditTransaction.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json(transactions);

    } catch (error) {
        console.error("Fetch Credit History Error", error);
        return NextResponse.json({ error: "Failed to fetch credit history" }, { status: 500 });
    }
}
