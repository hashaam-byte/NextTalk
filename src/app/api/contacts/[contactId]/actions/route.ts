import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function POST(
  req: Request,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();
    const { contactId } = params;

    switch (action) {
      case 'mute':
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            mutedChats: {
              push: contactId
            }
          }
        });
        break;

      case 'block':
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            blockedUsers: {
              connect: { id: contactId }
            }
          }
        });
        break;

      case 'report':
        // Add report logic here
        await prisma.report.create({
          data: {
            reporterId: session.user.id,
            reportedId: contactId,
            type: 'USER',
            reason: 'USER_REPORT'
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing contact action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
