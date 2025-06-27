import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    if (session.user.id !== data.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const validPrivacyLevels = ['public', 'friends', 'private'];
    if (!validPrivacyLevels.includes(data.privacyLevel)) {
      return NextResponse.json({ error: 'Invalid privacy level' }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        privacyLevel: data.privacyLevel,
        notificationPassword: data.requirePasswordForNotifications ? data.notificationPassword : null,
        chatPassword: data.requirePasswordForChats ? data.chatPassword : null,
        privacySettingsPassword: data.requirePasswordForPrivacySettings ? data.privacySettingsPassword : null, // Add this line
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
  }
}
