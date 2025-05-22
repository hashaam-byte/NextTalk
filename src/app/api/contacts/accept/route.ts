import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authConfig";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { notificationId, accept } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get notification first
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId
      },
      include: {
        user: true,
        sender: true,  // Use sender instead of fromUser
        group: true
      }
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Begin transaction
    await prisma.$transaction(async (tx) => {
      // Mark notification as read
      await tx.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });

      if (accept) {
        // Create bidirectional contact relationship
        await tx.user.update({
          where: { id: notification.userId },
          data: {
            contacts: {
              connect: { id: notification.sender.id }
            }
          }
        });

        await tx.user.update({
          where: { id: notification.sender.id },
          data: {
            contacts: {
              connect: { id: notification.userId }
            }
          }
        });

        // Create notification for the original sender
        await tx.notification.create({
          data: {
            type: "CONTACT_ACCEPTED",
            content: `${notification.user.name || 'Someone'} accepted your contact request`,
            userId: notificationId,
            senderId: notification.userId,  // Changed from fromUserId to senderId to match schema
            read: false
          }
        });
      } else {
        // Create rejection notification
        await tx.notification.create({
          data: {
            type: 'CONTACT_REJECTED',
            content: `${notification.user.name} declined your contact request`,
            userId: notification.sender.id,
            fromUserId: notification.userId
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ACCEPT_CONTACT]", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
