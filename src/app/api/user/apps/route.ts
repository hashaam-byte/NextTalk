import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { selectedApps: true, userApps: true }
    });

    return NextResponse.json({ apps: user?.selectedApps || [] });
  } catch (error) {
    console.error('Error fetching user apps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { apps } = await req.json();
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { selectedApps: apps }
    });

    return NextResponse.json({ apps: user.selectedApps });
  } catch (error) {
    console.error('Error updating user apps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
