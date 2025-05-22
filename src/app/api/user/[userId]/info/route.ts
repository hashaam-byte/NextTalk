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

    const { userId } = params;

    // Get user info and related data
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImage: true,
        bio: true,
        status: true,
        lastSeen: true,
        _count: {
          select: {
            contacts: true,
            groups: true,
            messages: true,
          },
        },
        messages: {
          where: {
            mediaUrl: { not: null },
          },
          select: {
            id: true,
            mediaUrl: true,
            createdAt: true,
            content: true, // Changed from type to content
          },
          take: 9,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!userInfo) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the response
    const response = {
      ...userInfo,
      sharedMedia: userInfo.messages.map((msg) => ({
        type: msg.mediaUrl?.split(".").pop() || "image", // Determine type from file extension
        url: msg.mediaUrl,
        timestamp: msg.createdAt,
      })),
    };

    delete response.messages; // Remove raw messages data

    return NextResponse.json(response);
  } catch (error) {
    console.error("[USER_INFO_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
