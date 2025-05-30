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

    await prisma.user.update({
      where: { id: contactRequest.senderId },
      data: {
        contacts: {
          connect: { id: contactRequest.recipientId },
        },
      },
    });

    await prisma.user.update({
      where: { id: contactRequest.recipientId },
      data: {
        contacts: {
          connect: { id: contactRequest.senderId },
        },
      },
    });

    await prisma.contactRequest.delete({
      where: { id: params.requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting contact request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
