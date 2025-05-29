import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to blob storage
    try {
      const filename = `stickers/${session.user.id}/${nanoid()}-${file.name}`;
      const { url } = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true,
      });

      // Save to database
      const sticker = await prisma.userMedia.create({
        data: {
          userId: session.user.id,
          url: url,
          type: 'sticker',
          fileType: file.type,
        }
      });

      // Get user's stickers
      const userStickers = await prisma.userMedia.findMany({
        where: {
          userId: session.user.id,
          type: 'sticker',
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        sticker,
        userStickers,
        url
      });

    } catch (error) {
      console.error('Blob upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
