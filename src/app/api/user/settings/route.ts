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
        settings: true,
        _count: {
          select: {
            contacts: true,
            messages: true,
            groups: true  // Add this line to count group memberships
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create settings if they don't exist
    let userSettings = user.settings;
    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: user.id
        }
      });
    }

    return NextResponse.json({
      settings: {
        profile: {
          name: user.name,
          email: user.email,
          bio: user.bio,
          profileImage: user.profileImage,
          joinDate: user.createdAt
        },
        preferences: {
          theme: userSettings.theme,
          language: userSettings.language,
          notifications: userSettings.notifications,
          soundEnabled: userSettings.soundEnabled,
          onlineStatus: userSettings.onlineStatus,
          readReceipts: userSettings.readReceipts,
          privacyLevel: userSettings.privacyLevel,
          messageSounds: userSettings.messageSounds,
          callRingtone: userSettings.callRingtone
        },
        stats: {
          contacts: user._count.contacts,
          messages: user._count.messages,
          groups: user._count.groups // Update this line to reflect the change
        }
      }
    });
  } catch (error) {
    console.error("[USER_SETTINGS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update both user and settings
    const [updatedUser, updatedSettings] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: data.profile?.name,
          bio: data.profile?.bio
        }
      }),
      prisma.userSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...data.preferences
        },
        update: data.preferences
      })
    ]);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      settings: updatedSettings
    });
  } catch (error) {
    console.error("[USER_SETTINGS_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
