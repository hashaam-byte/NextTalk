import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // Add your emoji search logic here
  // For now, return empty results
  return NextResponse.json({ results: [] });
}
