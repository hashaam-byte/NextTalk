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
  const { question, options } = await req.json();
  const poll = await prisma.poll.create({
    data: {
      chatId: params.chatId,
      question,
      options,
      votes: {}
    }
  });
  return NextResponse.json({ poll });
}
