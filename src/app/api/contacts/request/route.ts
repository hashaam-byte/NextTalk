import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";
import { sendContactRequestEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { email } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const recipient = await prisma.user.findUnique({
      where: { email }
    });

    if (!recipient) {
      // Send email invitation if user doesn't exist
      await sendContactRequestEmail({
        to: email,
        senderName: sender?.name || 'Someone',
        inviteLink: `${process.env.NEXTAUTH_URL}/register?invite=true&from=${sender?.email}`
      });

      return NextResponse.json({ status: 'INVITED' });
    }

    // Create contact request and notification
    const [request, notification] = await prisma.$transaction([
      prisma.contactRequest.create({
        data: {
          senderId: sender!.id,
          recipientId: recipient.id,
          status: 'PENDING'
        }
      }),
      prisma.notification.create({
        data: {
          userId: recipient.id,
          type: 'CONTACT_REQUEST',
          content: `${sender?.name} wants to add you as a contact`,
          fromUserId: sender!.id
        }
      })
    ]);

    return NextResponse.json({ status: 'REQUESTED', requestId: request.id });
  } catch (error) {
    console.error("[CONTACT_REQUEST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
