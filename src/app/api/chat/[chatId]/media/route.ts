import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'all';

    const media = await prisma.message.findMany({
      where: {
        chatId: params.chatId,
        mediaUrl: { not: null },
        ...(type !== 'all' && { mediaType: type })
      },
      select: {
        id: true,
        mediaUrl: true,
        mediaType: true,
        createdAt: true,
        content: true,
        sender: {
          select: {
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("[GET_MEDIA]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
