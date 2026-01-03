import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify the record belongs to the user
        const exportRecord = await prisma.exportRecord.findUnique({
            where: { id: id }
        });

        if (!exportRecord) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        if (exportRecord.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.exportRecord.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true, message: "Export record deleted" });

    } catch (error) {
        console.error("Delete Export Error", error);
        return NextResponse.json({ error: "Failed to delete export record" }, { status: 500 });
    }
}
