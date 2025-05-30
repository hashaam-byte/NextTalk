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

    // Get form data and check both 'file' and 'image' fields
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file || !(file instanceof Blob)) {
      console.log('No valid file provided in form data:', 
        'Fields available:', Array.from(formData.keys()));
      return NextResponse.json({ 
        error: 'No valid file provided',
        availableFields: Array.from(formData.keys())
      }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' 
      }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

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
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
