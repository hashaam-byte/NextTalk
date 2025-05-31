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

    const { messageId, targetChatIds } = await req.json();

    // Get original message
    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!originalMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Forward message to all target chats
    const forwardedMessages = await Promise.all(
      targetChatIds.map(async (targetChatId: string) => {
        return prisma.message.create({
          data: {
            content: originalMessage.content,
            chatId: targetChatId,
            senderId: session.user.id,
            forwardedFrom: messageId
          }
        });
      })
    );

    return NextResponse.json({ success: true, messages: forwardedMessages });
  } catch (error) {
    console.error("[FORWARD_MESSAGE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
