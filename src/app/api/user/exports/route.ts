import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const exports = await prisma.exportRecord.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json(exports);

    } catch (error) {
        console.error("Fetch Exports Error", error);
        return NextResponse.json({ error: "Failed to fetch exports" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.exportRecord.deleteMany({
            where: { userId: session.user.id }
        });

        return NextResponse.json({ success: true, message: "All exports deleted" });

    } catch (error) {
        console.error("Bulk Delete Exports Error", error);
        return NextResponse.json({ error: "Failed to delete exports" }, { status: 500 });
    }
}
