import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';
import { compare } from 'bcryptjs';

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const { pin } = await req.json();
  const chat = await prisma.chat.findUnique({ where: { id: params.chatId } });
  if (!chat || !chat.locked || !chat.lockPin) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const isValid = await compare(pin, chat.lockPin);
  if (isValid) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 403 });
}
