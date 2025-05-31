import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify the message exists and belongs to the user
    const message = await prisma.message.findFirst({
      where: {
        id: params.messageId,
        chatId: params.chatId,
        sender: {
          email: session.user.email
        }
      }
    });

    if (!message) {
      return NextResponse.json({ 
        error: "Message not found or you don't have permission to delete it" 
      }, { status: 403 });
    }

    // Delete the message
    await prisma.message.delete({
      where: {
        id: params.messageId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MESSAGE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    // Verify message exists and user has permission
    const message = await prisma.message.findFirst({
      where: {
        id: params.messageId,
        chatId: params.chatId,
        chat: {
          participants: {
            some: {
              user: {
                email: session.user.email
              }
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Update message based on action
    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: {
        isStarred: action === 'star' ? true : action === 'unstar' ? false : undefined,
        isPinned: action === 'pin' ? true : action === 'unpin' ? false : undefined
      }
    });

    return NextResponse.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error("[MESSAGE_UPDATE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
