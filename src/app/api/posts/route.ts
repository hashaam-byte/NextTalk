import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';
import { v2 as cloudinary } from 'cloudinary';
import { compare } from 'bcryptjs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  // Handles creating a new post (image/video)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('media') as File;
    const caption = formData.get('caption') as string;
    const visibility = formData.get('visibility') as string;
    const viewersIds = formData.get('viewersIds') as string;

    if (!file) {
      return NextResponse.json({ error: 'No media file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'nexttalk_posts',
      resource_type: file.type.startsWith('video/') ? 'video' : 'image',
    });

    // Create post with Cloudinary URL
    const post = await prisma.post.create({
      data: {
        mediaUrl: uploadResponse.secure_url,
        content: caption || '',
        mediaType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        visibility: (visibility?.toUpperCase() as any) || 'PUBLIC',
        viewersIds: viewersIds ? JSON.parse(viewersIds) : [],
        user: { connect: { id: session.user.id } }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('new:post', post);
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('[POSTS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Fetch posts visible to the user (public, contacts, private)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const mine = url.searchParams.get('mine');

    if (mine === '1' && userId) {
      // Fetch only posts created by this user
      const posts = await prisma.post.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            }
          },
          likes: {
            select: {
              id: true,
              userId: true,
              user: { select: { id: true, name: true, profileImage: true } }
            }
          },
          comments: {
            select: {
              id: true,
              content: true,
              userId: true,
              createdAt: true,
              user: { select: { id: true, name: true, profileImage: true } }
            }
          },
          _count: {
            select: { likes: true, comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ posts });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, contacts: { select: { id: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          {
            visibility: 'CONTACTS',
            userId: { in: user.contacts.map(c => c.id) }
          },
          {
            visibility: 'PRIVATE',
            viewersIds: { has: user.id }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, profileImage: true } }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            userId: true,
            createdAt: true,
            user: { select: { id: true, name: true, profileImage: true } }
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('[POSTS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// --- Likes endpoint ---
export async function PUT(req: Request) {
  // Handles like/unlike
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId, action } = await req.json();
    if (!postId || !['like', 'unlike'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'like') {
      await prisma.like.upsert({
        where: { userId_postId: { userId: user.id, postId } },
        update: {},
        create: { userId: user.id, postId }
      });
    } else {
      await prisma.like.deleteMany({
        where: { userId: user.id, postId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POSTS_LIKE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// --- Comments endpoint ---
export async function PATCH(req: Request) {
  // Handles adding a comment
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId, content } = await req.json();
    if (!postId || !content) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
        content,
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } }
      }
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('[POSTS_COMMENT]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// --- Post by ID endpoint ---
/*
export async function GET(req: Request) {
  // Fetch a single post by ID
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const postId = url.searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, profileImage: true } }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            userId: true,
            createdAt: true,
            user: { select: { id: true, name: true, profileImage: true } }
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the post is locked and requires a PIN
    if (post.locked) {
      const pin = req.headers.get('x-post-pin');
      if (!pin || !post.postPin) {
        return NextResponse.json({ error: 'Post locked. PIN required.' }, { status: 401 });
      }
      const isValid = await compare(pin, post.postPin);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('[POST_GET_BY_ID]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
*/

// --- Update post by ID endpoint ---
export async function PATCH(req: Request) {
  // Handles updating a post (caption, visibility, media)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, caption, visibility, media, viewersIds } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the post is locked and requires a PIN
    if (post.locked) {
      const pin = req.headers.get('x-post-pin');
      if (!pin || !post.postPin) {
        return NextResponse.json({ error: 'Post locked. PIN required.' }, { status: 401 });
      }
      const isValid = await compare(pin, post.postPin);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
      }
    }

    let mediaUrl = post.mediaUrl;
    let mediaType = post.mediaType;

    if (media) {
      // If new media is provided, upload it to Cloudinary
      const file = media as File;
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'nexttalk_posts',
        resource_type: file.type.startsWith('video/') ? 'video' : 'image',
      });

      mediaUrl = uploadResponse.secure_url;
      mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    }

    // Update post in the database
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: caption || '',
        mediaUrl,
        mediaType,
        visibility: (visibility?.toUpperCase() as any) || 'PUBLIC',
        viewersIds: viewersIds ? JSON.parse(viewersIds) : [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, profileImage: true } }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            userId: true,
            createdAt: true,
            user: { select: { id: true, name: true, profileImage: true } }
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('[POST_UPDATE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// --- Delete post by ID endpoint ---
export async function DELETE(req: Request) {
  // Handles deleting a post
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const postId = url.searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the post is locked and requires a PIN
    if (post.locked) {
      const pin = req.headers.get('x-post-pin');
      if (!pin || !post.postPin) {
        return NextResponse.json({ error: 'Post locked. PIN required.' }, { status: 401 });
      }
      const isValid = await compare(pin, post.postPin);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
      }
    }

    // Delete post
    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
