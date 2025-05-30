import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch pending contact requests
    const requests = await prisma.contactRequest.findMany({
      where: {
        recipientId: user.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact requests' },
      { status: 500 }
    );
  }
}
