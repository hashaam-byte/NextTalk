import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';
import { compare } from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        profileImage: true,
        lastSeen: true,
        createdAt: true,
        privacyLevel: true,
        profileLocked: true,
        profilePin: true,
      }
    });

    if (
      user.privacyLevel === 'private' &&
      session.user.id !== user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }
    if (user.profileLocked && session.user.id !== user.id && session.user.role !== 'admin') {
      const pin = url.searchParams.get('pin');
      if (!pin || !user.profilePin) {
        return NextResponse.json({ error: 'Profile locked. PIN required.' }, { status: 401 });
      }
      const isValid = await compare(pin, user.profilePin);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        profileImage: true,
        lastSeen: true,
        createdAt: true,
        privacyLevel: true,
        profileLocked: true,
        profilePin: true,
      }
    });

    const { name, email, phone, bio, profileImage, privacyLevel, profileLocked, profilePin } = body;

    if (user.profileLocked && session.user.id !== userId && session.user.role !== 'admin') {
      const pin = body.pin;
      if (!pin || !user.profilePin) {
        return NextResponse.json({ error: 'Profile locked. PIN required.' }, { status: 401 });
      }
      const isValid = await compare(pin, user.profilePin);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        bio,
        profileImage,
        privacyLevel,
        profileLocked,
        profilePin,
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
