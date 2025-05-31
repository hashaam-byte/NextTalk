import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await req.json();

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isPinned: true }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("[PIN_MESSAGE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await req.json();

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isPinned: false }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("[UNPIN_MESSAGE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
