import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        _count: {
          select: {
            messages: true,
            contacts: true,
            participants: {
              where: {
                chat: { isGroup: true }
              }
            }
          }
        },
        messages: {
          where: { mediaUrl: { not: null } },
          select: { id: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent activities - Updated include statement
    const recentActivities = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: {  // Changed from fromUser to sender
          select: { name: true }
        }
      }
    });

    // Get online friends
    const onlineFriends = await prisma.user.findMany({
      where: {
        AND: [
          { contactOf: { some: { id: user.id } } },
          { lastSeen: { gt: new Date(Date.now() - 5 * 60 * 1000) } }
        ]
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        status: true
      },
      take: 5
    });

    return NextResponse.json({
      stats: {
        messages: user._count.messages,
        contacts: user._count.contacts,
        groups: user._count.participants,
        mediaShared: user.messages.length
      },
      activities: recentActivities.map(activity => ({
        type: activity.type,
        content: activity.content,
        time: activity.createdAt,
        fromUser: activity.sender?.name  // Changed from fromUser to sender
      })),
      onlineFriends
    });
  } catch (error) {
    console.error("[USER_STATS]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
