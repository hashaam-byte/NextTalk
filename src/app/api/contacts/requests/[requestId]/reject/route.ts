import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: params.requestId },
    });

    if (!contactRequest) {
      return NextResponse.json({ error: 'Contact request not found' }, { status: 404 });
    }

    await prisma.notification.create({
      data: {
        userId: contactRequest.senderId,
        type: 'CONTACT_REQUEST_REJECTED',
        content: `Your contact request to ${contactRequest.recipientId} was rejected.`,
      },
    });

    await prisma.contactRequest.delete({
      where: { id: params.requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting contact request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
