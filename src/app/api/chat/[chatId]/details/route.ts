import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

const ONLINE_THRESHOLD = 3 * 60 * 1000; // 3 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update current user's last seen
    await prisma.user.update({
      where: { email: session.user.email },
      data: { lastSeen: new Date() }
    });

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            user: {
              email: session.user.email
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                lastSeen: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const otherParticipant = chat.participants.find(
      p => p.user.email !== session.user.email
    );

    if (!otherParticipant) {
      return NextResponse.json({ error: "Invalid chat" }, { status: 400 });
    }

    const isOnline = otherParticipant.user.lastSeen 
      ? Date.now() - new Date(otherParticipant.user.lastSeen).getTime() < ONLINE_THRESHOLD
      : false;

    return NextResponse.json({
      id: chat.id,
      name: otherParticipant.user.name,
      avatar: otherParticipant.user.profileImage,
      isOnline,
      lastSeen: otherParticipant.user.lastSeen,
      status: otherParticipant.user.status || 'offline'
    });
  } catch (error) {
    console.error("[CHAT_DETAILS]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
