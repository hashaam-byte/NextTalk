import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename using nanoid
    const uniqueId = nanoid();
    const filename = `uploads/${uniqueId}-${file.name}`;

    // Upload to Vercel Blob storage
    const { url } = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true
    });

    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' }, 
      { status: 500 }
    );
  }
}
