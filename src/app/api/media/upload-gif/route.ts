import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Allow any GIF file
    if (!file.type.includes('gif')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only GIF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 15MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = `gifs/${session.user.id}/${nanoid()}.gif`;

    // Upload to Vercel Blob
    const { url } = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000, // 1 year cache
    });

    // Save to database
    const gif = await prisma.userMedia.create({
      data: {
        userId: session.user.id,
        url: url,
        type: 'gif',
        fileType: file.type,
      },
    });

    // Get user's GIF pack
    const userGifs = await prisma.userMedia.findMany({
      where: {
        userId: session.user.id,
        type: 'gif',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      url,
      gif,
      userGifs,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
