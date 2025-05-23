import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

// Update call status
export async function PATCH(
  req: Request,
  { params }: { params: { callId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId } = params;
    const { status } = await req.json();

    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status,
        ...(status === 'ONGOING' ? { startTime: new Date() } : {}),
        ...(status === 'ENDED' ? { endTime: new Date() } : {})
      }
    });

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
}
