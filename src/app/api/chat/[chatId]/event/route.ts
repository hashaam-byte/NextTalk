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
  const { title, date, location } = await req.json();
  const event = await prisma.event.create({
    data: {
      chatId: params.chatId,
      title,
      date: new Date(date),
      location
    }
  });
  return NextResponse.json({ event });
}
