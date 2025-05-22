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
            groups: true
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

    // Get recent activities with safe access
    const recentActivities = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: {
          select: { name: true }
        }
      }
    }) || [];

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
    }) || [];

    return NextResponse.json({
      stats: {
        messages: user._count?.messages || 0,
        contacts: user._count?.contacts || 0,
        groups: user._count?.groups || 0,
        mediaShared: user.messages?.length || 0
      },
      activities: recentActivities.map(activity => ({
        type: activity.type,
        content: activity.content,
        time: activity.createdAt,
        fromUser: activity.sender?.name
      })),
      onlineFriends
    });

  } catch (error) {
    console.error("[USER_STATS]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
