import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update all unread notifications for the user
    await prisma.notification.updateMany({
      where: {
        user: { email: session.user.email },
        read: false
      },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MARK_ALL_READ]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
