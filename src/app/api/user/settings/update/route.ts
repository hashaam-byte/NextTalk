import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const data = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or create user settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        theme: data.theme,
        language: data.language,
        notifications: data.notifications,
        soundEnabled: data.soundEnabled,
        onlineStatus: data.onlineStatus,
        readReceipts: data.readReceipts,
        privacyLevel: data.privacyLevel,
        messageSounds: data.messageSounds,
        callRingtone: data.callRingtone
      },
      create: {
        userId: user.id,
        ...data
      }
    });

    // Also update relevant user fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        theme: data.theme,
        language: data.language,
        notifications: data.notifications,
        readReceipts: data.readReceipts,
        privacyLevel: data.privacyLevel
      }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[SETTINGS_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
