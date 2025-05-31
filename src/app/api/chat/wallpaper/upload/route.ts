import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from "@/lib/authConfig";

// Configure Cloudinary with actual credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    try {
      // Upload to Cloudinary with specific folder and format
      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'chat-wallpapers',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
          { width: 1920, height: 1080, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });

      return NextResponse.json({ 
        url: uploadResponse.secure_url,
        success: true 
      });
    } catch (cloudinaryError: any) {
      console.error('[CLOUDINARY_UPLOAD]', cloudinaryError);
      return NextResponse.json({ 
        error: "Failed to upload image",
        details: cloudinaryError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[WALLPAPER_UPLOAD]', error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
