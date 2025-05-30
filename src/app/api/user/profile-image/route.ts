import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    // Get session without authOptions
    const session = await getServerSession();

    // More detailed session check
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!session.user?.email) {
      console.log('No user email in session');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // First check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64Image}`;

    // Add error handling for Cloudinary upload
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'nexttalk/profile-images',
      public_id: `user-${user.id}`, // Use user.id instead of email
      overwrite: true,
    }).catch(err => {
      console.error('Cloudinary upload error:', err);
      throw new Error('Failed to upload to Cloudinary');
    });

    // Update user profile with new image URL
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: uploadResponse.secure_url }
    });

    return NextResponse.json({
      success: true,
      imageUrl: uploadResponse.secure_url,
      message: 'Profile image updated successfully'
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile image', details: error.message },
      { status: 500 }
    );
  }
}
