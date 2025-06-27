import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ isParticipant: false, locked: false }, { status: 401 });
  }
  const chat = await prisma.chat.findUnique({
    where: { id: params.chatId },
    include: { participants: true }
  });
  if (!chat) {
    return NextResponse.json({ isParticipant: false, locked: false }, { status: 404 });
  }
  const isParticipant = chat.participants.some(p => p.userId === session.user.id);
  return NextResponse.json({ isParticipant, locked: chat.locked || false });
}
