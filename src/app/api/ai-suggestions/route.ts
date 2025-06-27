import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ suggestions: [] }, { status: 401 });
  }
  // Fetch AI suggestions for the user
  const suggestions = await prisma.aiSuggestion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  return NextResponse.json({ suggestions });
}
