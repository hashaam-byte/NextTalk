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

    // Delete all messages for this user in the chat
    await prisma.message.deleteMany({
      where: {
        chatId: params.chatId,
        senderId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLEAR_CHAT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
