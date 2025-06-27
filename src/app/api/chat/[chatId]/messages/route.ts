import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";
import { compare } from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  try {
    const session = await getServerSession(authOptions);
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true }
    });
    if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    const isParticipant = chat.participants.some(p => p.userId === session.user.id);
    if (!isParticipant) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    if (chat.locked) {
      const pin = req.headers.get('x-chat-pin');
      if (!pin || !chat.lockPin) {
        return NextResponse.json({ error: 'Chat locked. PIN required.' }, { status: 401 });
      }
      const isValid = await compare(pin, chat.lockPin);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
      }
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
        fromUserId: user.id
      }))
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
