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
    const query = url.searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: params.chatId,
        content: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
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

    return NextResponse.json({ results: messages });
  } catch (error) {
    console.error("[SEARCH_MESSAGES]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
