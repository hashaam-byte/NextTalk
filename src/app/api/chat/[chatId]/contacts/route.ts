import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { contactId, name, phone } = await req.json();
  const message = await prisma.message.create({
    data: {
      chatId: params.chatId,
      senderId: session.user.id,
      mediaType: 'TEXT',
      content: `Contact: ${name} (${phone})`,
      status: 'sent'
    }
  });
  return NextResponse.json({ message });
}
