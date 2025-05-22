import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ 
        stats: { messages: 0, contacts: 0, groups: 0 },
        onlineContacts: [],
        activities: [],
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        contacts: true,
        messages: true,
        participants: {
          include: {
            chat: {
              include: {
                messages: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ 
        stats: { messages: 0, contacts: 0, groups: 0 },
        onlineContacts: [],
        activities: [],
        error: "User not found" 
      }, { status: 404 });
    }

    // Calculate stats with default values
    const stats = {
      messages: await prisma.message.count({
        where: { senderId: user.id }
      }) || 0,
      contacts: await prisma.user.count({
        where: {
          contactOf: {
            some: { id: user.id }
          }
        }
      }) || 0,
      groups: await prisma.chat.count({
        where: {
          isGroup: true,
          participants: {
            some: { userId: user.id }
          }
        }
      }) || 0
    };

    // Get online contacts
    const onlineContacts = await prisma.user.findMany({
      where: {
        AND: [
          { contactOf: { some: { id: user.id } } },
          { lastSeen: { gt: new Date(Date.now() - 5 * 60 * 1000) } } // Online in last 5 minutes
        ]
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        lastSeen: true
      }
    }) || [];

    // Get recent activities - Updated include statement
    const activities = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        sender: {  // Changed from fromUser to sender
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    }) || [];

    return NextResponse.json({
      stats,
      onlineContacts,
      activities: activities.map(activity => ({
        type: activity.type,
        content: activity.content,
        time: activity.createdAt,
        fromUser: activity.sender?.name  // Changed from fromUser to sender
      }))
    });
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return NextResponse.json({ 
      stats: { messages: 0, contacts: 0, groups: 0 },
      onlineContacts: [],
      activities: [],
      error: "Internal server error" 
    }, { 
      status: 500 
    });
  }
}
