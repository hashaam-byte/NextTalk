import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";
import { sendInviteEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ contacts: [], error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        contacts: {
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
    });

    return NextResponse.json({ contacts: user?.contacts || [] });
  } catch (error) {
    console.error("[CONTACTS_GET]", error);
    return NextResponse.json({ contacts: [], error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { email } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the contact exists
    const contactUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!contactUser) {
      // Send invitation email if user doesn't exist
      await sendInviteEmail({
        to: email,
        senderName: currentUser.name || "Someone",
        inviteLink: `${process.env.NEXTAUTH_URL}/register?invite=${Buffer.from(email).toString('base64')}`
      });

      return NextResponse.json({
        message: "Invitation sent to join NexTalk",
        status: "INVITED"
      });
    }

    // Check if request already exists
    const existingRequest = await prisma.contactRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, recipientId: contactUser.id },
          { senderId: contactUser.id, recipientId: currentUser.id }
        ]
      }
    });

    if (existingRequest) {
      return NextResponse.json({
        error: "Contact request already exists",
        status: existingRequest.status
      }, { status: 400 });
    }

    // Create contact request
    await prisma.contactRequest.create({
      data: {
        senderId: currentUser.id,
        recipientId: contactUser.id,
        status: "PENDING"
      }
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: contactUser.id,
        type: "CONTACT_REQUEST",
        content: `${currentUser.name} wants to connect with you`,
        fromUserId: currentUser.id
      }
    });

    return NextResponse.json({
      message: "Contact request sent successfully",
      status: "PENDING"
    });
  } catch (error) {
    console.error("[CONTACTS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
