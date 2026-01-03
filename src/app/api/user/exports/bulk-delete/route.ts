import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ids } = await req.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
        }

        // Delete records belonging to the user
        const result = await prisma.exportRecord.deleteMany({
            where: {
                id: { in: ids },
                userId: session.user.id
            }
        });

        return NextResponse.json({
            success: true,
            message: `${result.count} exports deleted`,
            count: result.count
        });

    } catch (error) {
        console.error("Bulk Delete Exports Error", error);
        return NextResponse.json({ error: "Failed to delete exports" }, { status: 500 });
    }
}
