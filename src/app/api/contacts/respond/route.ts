import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { contactId, action } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contactRequest = await prisma.contact.findFirst({
      where: {
        contactId: user.id,
        userId: contactId,
        status: 'PENDING'
      },
      include: {
        user: true
      }
    });

    if (!contactRequest) {
      return NextResponse.json({ error: "Contact request not found" }, { status: 404 });
    }

    if (action === 'ACCEPT') {
      // Update status to accepted
      await prisma.contact.update({
        where: { id: contactRequest.id },
        data: { status: 'ACCEPTED' }
      });

      // Create reverse contact relationship
      await prisma.contact.create({
        data: {
          userId: user.id,
          contactId: contactId,
          status: 'ACCEPTED'
        }
      });

      // Create acceptance notification
      await prisma.notification.create({
        data: {
          userId: contactRequest.userId,
          type: 'CONTACT_ACCEPTED',
          content: `${user.name} accepted your contact request`,
          fromUserId: user.id
        }
      });
    } else {
      // Delete the request if denied
      await prisma.contact.delete({
        where: { id: contactRequest.id }
      });

      // Create denial notification
      await prisma.notification.create({
        data: {
          userId: contactRequest.userId,
          type: 'CONTACT_DENIED',
          content: `${user.name} denied your contact request`,
          fromUserId: user.id
        }
      });
    }

    return NextResponse.json({ message: `Contact request ${action.toLowerCase()}ed` });
  } catch (error) {
    console.error("[CONTACT_RESPOND]", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
