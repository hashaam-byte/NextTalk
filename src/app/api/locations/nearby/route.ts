import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    // Example: fetch locations from your DB (adjust as needed)
    const locations = await prisma.location.findMany({
      // Optionally, filter by proximity using lat/lng
      take: 20
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('[LOCATIONS_NEARBY_GET]', error);
    return NextResponse.json({ locations: [] }, { status: 500 });
  }
}
