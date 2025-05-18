import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch groups where user is either owner or member
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { id: user.id } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            lastSeen: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      groups: groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        memberCount: group.members.length,
        lastActivity: group.messages[0]?.createdAt || group.updatedAt,
        isAdmin: group.ownerId === user.id,
        isPublic: group.isPublic
      }))
    });
  } catch (error) {
    console.error("[GROUPS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { name, description, isPublic } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        isPublic,
        ownerId: user.id,
        members: {
          connect: { id: user.id }
        }
      }
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error("[GROUPS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
