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

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const { content } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sender's info
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    });

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        chatId: params.chatId,
        senderId: sender.id,
        status: 'sent',
        timestamp: new Date()
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

    // Get other participants in the chat
    const otherParticipants = await prisma.participant.findMany({
      where: {
        chatId: params.chatId,
        userId: { not: sender.id }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notifications for each participant
    await prisma.notification.createMany({
      data: otherParticipants.map(participant => ({
        userId: participant.userId,
        type: 'MESSAGE',
        content: `${sender.name}: ${content}`,
        senderId: sender.id,
        chatId: params.chatId,
        createdAt: new Date(),
        read: false
      }))
    });

    // Emit real-time notifications via socket
    if (global.io) {
      otherParticipants.forEach(participant => {
        global.io.to(participant.userId).emit('notification', {
          type: 'MESSAGE',
          content: `${sender.name}: ${content}`,
          senderId: sender.id,
          senderName: sender.name,
          senderImage: sender.profileImage,
          chatId: params.chatId,
          timestamp: new Date(),
          messageId: message.id
        });
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
