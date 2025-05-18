import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { status } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update user's status and last seen
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        status,
        lastSeen: new Date()
      }
    });

    return NextResponse.json({ status: user.status });
  } catch (error) {
    console.error("[STATUS_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update last seen and return current status
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { lastSeen: new Date() }
    });

    return NextResponse.json({ 
      status: user.status,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error("[STATUS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
