import { NextResponse } from 'next/server';
import { aggregateTopicData } from '@/lib/api/aggregator';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || undefined;

    // Use the aggregator to fetch gaming data
    const data = await aggregateTopicData('games', query);

    return NextResponse.json({
      success: true,
      data: data.items ? data : { items: [] }
    });
  } catch (error) {
    console.error('[GAMING_INFO]', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch gaming topic information',
      data: { items: [] }
    }, { status: 200 });
  }
}
