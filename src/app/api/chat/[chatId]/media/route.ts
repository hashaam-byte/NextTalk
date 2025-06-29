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

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  // For demo: just store file as a base64 string (replace with cloud upload in production)
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
  const mediaType = file.type.startsWith('image') ? 'IMAGE'
    : file.type.startsWith('video') ? 'VIDEO'
    : file.type.startsWith('audio') ? 'AUDIO'
    : 'DOCUMENT';
  const message = await prisma.message.create({
    data: {
      chatId: params.chatId,
      senderId: session.user.id,
      mediaUrl: base64,
      mediaType,
      content: mediaType === 'DOCUMENT' ? file.name : '',
      status: 'sent'
    }
  });
  return NextResponse.json({ message });
}
