import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  // TODO: Handle image upload from camera (base64 or file)
  // For now, just return success
  return NextResponse.json({ success: true });
}
