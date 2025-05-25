import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authConfig";

export async function POST(
  req: Request,
  { params }: { params: { callId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { accepted } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const call = await prisma.call.findUnique({
      where: { id: params.callId },
      include: { caller: true }
    });

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Update call status
    const updatedCall = await prisma.call.update({
      where: { id: params.callId },
      data: {
        status: accepted ? 'ongoing' : 'declined',
        answeredAt: accepted ? new Date() : null
      }
    });

    // Emit socket event for call status
    if (global.io) {
      if (accepted) {
        global.io.to(call.callerId).emit('call:accepted', {
          callId: call.id,
          startTime: updatedCall.answeredAt
        });
      } else {
        global.io.to(call.callerId).emit('call:rejected', {
          callId: call.id
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CALL_ANSWER]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
