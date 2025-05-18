import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        name: true,
        bio: true,
        profileImage: true,
        messages: {
          where: {
            mediaUrl: { not: null }
          },
          select: {
            mediaUrl: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 9
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      bio: user.bio,
      sharedMedia: user.messages.map(msg => ({
        type: 'image',
        url: msg.mediaUrl,
        timestamp: msg.createdAt
      }))
    });
  } catch (error) {
    console.error("[USER_INFO]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
