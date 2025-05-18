import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { contactId } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if a private chat already exists between these two users
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            participants: {
              some: { userId: currentUser.id }
            }
          },
          {
            participants: {
              some: { userId: contactId }
            }
          }
        ]
      }
    });

    if (existingChat) {
      return NextResponse.json({ chatId: existingChat.id });
    }

    // Create new private chat for two users
    const chat = await prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: currentUser.id },
            { userId: contactId }
          ]
        }
      }
    });

    return NextResponse.json({ chatId: chat.id });
  } catch (error) {
    console.error("[CHAT_CREATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
