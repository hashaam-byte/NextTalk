import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ messages: [], error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is participant in this chat
    const participant = await prisma.participant.findFirst({
      where: {
        chatId: params.chatId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ messages: [], error: "Not authorized to view this chat" }, { status: 403 });
    }

    // Get messages only for this private chat
    const messages = await prisma.message.findMany({
      where: {
        chatId: params.chatId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return NextResponse.json({ messages: [], error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: { chatId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const { chatId } = context.params;
    const { content } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        chatId,
        senderId: user.id,
        status: 'sent'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });

    // Create notification for other chat participants
    const otherParticipants = await prisma.participant.findMany({
      where: {
        chatId,
        userId: { not: user.id }
      }
    });

    await prisma.notification.createMany({
      data: otherParticipants.map(participant => ({
        userId: participant.userId,
        type: 'MESSAGE',
        content: `New message from ${user.name || 'Someone'}`,
        senderId: user.id // Changed from fromUserId to senderId
      }))
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
