import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function PUT(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wallpaper } = await req.json();

    await prisma.participant.updateMany({
      where: {
        chatId: chatId,
        user: { email: session.user.email }
      },
      data: {
        wallpaper
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UPDATE_WALLPAPER]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
