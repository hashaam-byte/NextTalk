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

    const { contactId } = await req.json();

    await prisma.$transaction(async (tx) => {
      // Remove from contacts
      await tx.user.update({
        where: { email: session.user.email },
        data: {
          contacts: {
            disconnect: { id: contactId }
          }
        }
      });

      // Add to blocked users
      await tx.user.update({
        where: { email: session.user.email },
        data: {
          blockedUsers: {
            connect: { id: contactId }
          }
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BLOCK_CONTACT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
