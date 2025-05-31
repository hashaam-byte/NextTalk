import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find participant's wallpaper setting
    const participant = await prisma.participant.findFirst({
      where: {
        chatId: params.chatId,
        user: {
          email: session.user.email
        }
      }
    });

    return NextResponse.json({ wallpaper: participant?.wallpaper });
  } catch (error) {
    console.error("[WALLPAPER_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wallpaper } = await req.json();

    // Update participant's wallpaper setting
    await prisma.participant.updateMany({
      where: {
        chatId: params.chatId,
        user: {
          email: session.user.email
        }
      },
      data: {
        wallpaper
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WALLPAPER_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
