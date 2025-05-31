import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, accept } = await req.json();

    await prisma.$transaction(async (tx) => {
      // Get notification details
      const notification = await tx.notification.findUnique({
        where: { id: notificationId },
        include: { sender: true }
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      if (accept) {
        // Create bidirectional contact relationship
        await tx.user.update({
          where: { id: notification.userId },
          data: {
            contacts: {
              connect: { id: notification.senderId! }
            }
          }
        });

        await tx.user.update({
          where: { id: notification.senderId! },
          data: {
            contacts: {
              connect: { id: notification.userId }
            }
          }
        });
      }

      // Delete the contact request
      await tx.contactRequest.deleteMany({
        where: {
          OR: [
            { senderId: notification.senderId!, recipientId: notification.userId },
            { senderId: notification.userId, recipientId: notification.senderId! }
          ]
        }
      });

      // Delete the notification
      await tx.notification.delete({
        where: { id: notificationId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATION_ACCEPT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
