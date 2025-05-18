import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ chats: [], error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chat.findMany({
      where: {
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
                lastSeen: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(
        p => p.user.email !== session.user.email
      );
      const lastMessage = chat.messages[0] || null;

      return {
        id: chat.id,
        name: chat.isGroup ? chat.name : otherParticipant?.user.name,
        avatar: chat.isGroup ? chat.avatar : otherParticipant?.user.profileImage,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          timestamp: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          sender: lastMessage.sender
        } : null,
        timestamp: chat.updatedAt,
        isOnline: otherParticipant?.user.lastSeen ? 
          (Date.now() - new Date(otherParticipant.user.lastSeen).getTime() < 300000) 
          : false,
        lastSeen: otherParticipant?.user.lastSeen,
        unread: 0, // You might want to calculate this based on unread messages
        isGroup: chat.isGroup
      };
    });

    return NextResponse.json({ chats: formattedChats });
  } catch (error) {
    console.error("[CHATS_GET]", error);
    return NextResponse.json({ 
      chats: [],
      error: "Internal server error" 
    }, { 
      status: 500 
    });
  }
}
