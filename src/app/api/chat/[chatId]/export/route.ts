import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is part of chat
    const participant = await prisma.participant.findFirst({
      where: {
        chatId: params.chatId,
        user: { email: session.user.email }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Not authorized to export this chat" }, { status: 403 });
    }

    // Get all messages with sender info
    const messages = await prisma.message.findMany({
      where: { chatId: params.chatId },
      include: {
        sender: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Format messages for export
    const exportData = {
      exportDate: new Date(),
      chatId: params.chatId,
      messages: messages.map(msg => ({
        content: msg.content,
        sender: msg.sender.name,
        timestamp: msg.createdAt,
        type: msg.mediaUrl ? 'media' : 'text'
      }))
    };

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="chat-${params.chatId}-export.json"`
      }
    });
  } catch (error) {
    console.error("[EXPORT_CHAT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
