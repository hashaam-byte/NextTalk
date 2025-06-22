import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    const locations = await prisma.location.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 20
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('[LOCATIONS_SEARCH_GET]', error);
    return NextResponse.json({ locations: [] }, { status: 500 });
  }
}
