import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Get session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${(file as File).type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary with error handling
    try {
      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'nexttalk/profile-images',
        public_id: `user-${user.id}`,
        overwrite: true,
      });

      // Update user profile image
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: uploadResponse.secure_url },
      });

      return NextResponse.json({
        success: true,
        imageUrl: uploadResponse.secure_url
      });

    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return NextResponse.json({ 
        error: 'Failed to upload image to cloud storage'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
