import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  // Return list of media messages for gallery
  const images = await prisma.message.findMany({
    where: { chatId: params.chatId, mediaUrl: { not: null } },
    select: { id: true, mediaUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ images });
}
