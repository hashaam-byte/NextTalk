import { NextResponse } from 'next/server';
import { aggregateTopicData } from '@/lib/api/aggregator';

export async function GET(
  req: Request,
  context: { params: { topic: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    
    if (!params || typeof params.topic !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid topic parameter',
        data: { items: [] }
      }, { status: 400 });
    }

    const topic = params.topic;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const validTopics = ['anime', 'games', 'movies', 'technology', 'music', 'books', 'programming'];
    if (!validTopics.includes(topic)) {
      return NextResponse.json({
        success: false,
        error: `Invalid topic. Must be one of: ${validTopics.join(', ')}`,
        data: { items: [] }
      }, { status: 400 });
    }

    const data = await aggregateTopicData(topic, query || undefined);

    return NextResponse.json({
      success: true,
      data: data.items ? data : { items: [] }
    });

  } catch (error) {
    console.error('[TOPIC_INFO]', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch topic information',
      data: { items: [] }
    }, { status: 200 });
  }
}
