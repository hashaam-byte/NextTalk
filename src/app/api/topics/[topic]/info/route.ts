import { NextResponse } from 'next/server';
import { fetchAnimeData } from '@/lib/api/anime';
import { fetchGameData } from '@/lib/api/games';
import { fetchMovieData } from '@/lib/api/movies';
import { fetchTechData } from '@/lib/api/technology';
import { fetchMusicData } from '@/lib/api/music';
import { fetchBookData } from '@/lib/api/books';
import { fetchProgrammingData } from '@/lib/api/programming';

const SUPPORTED_TOPICS = [
  'anime',
  'games',
  'movies',
  'technology',
  'music',
  'books',
  'programming',
  'gaming',
];

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(fetcher: Function, ...args: any[]) {
  let lastError;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const data = await fetcher(...args);
      return { success: true, data };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Failed to fetch data',
    data: { items: [] },
  };
}

export async function GET(
  req: Request,
  { params }: { params: { topic: string } }
) {
  try {
    const { topic } = params;

    if (!SUPPORTED_TOPICS.includes(topic)) {
      return NextResponse.json(
        {
          success: false,
          error: `Topic '${topic}' not supported. Available topics: ${SUPPORTED_TOPICS.join(
            ', '
          )}`,
          data: { items: [] },
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const subtopic = searchParams.get('subtopic');
    const category = searchParams.get('category');

    let result;

    switch (topic) {
      case 'programming':
        result = await fetchWithRetry(fetchProgrammingData, subtopic, category);
        break;

      case 'gaming':
        // Redirect to games endpoint for backward compatibility
        result = await fetchWithRetry(fetchGameData, subtopic, category);
        break;

      case 'anime':
        result = await fetchWithRetry(fetchAnimeData, subtopic, category);
        break;

      case 'movies':
        result = await fetchWithRetry(fetchMovieData, subtopic, category);
        break;

      case 'technology':
        result = await fetchWithRetry(fetchTechData, subtopic, category);
        break;

      case 'music':
        result = await fetchWithRetry(fetchMusicData, subtopic, category);
        break;

      case 'books':
        result = await fetchWithRetry(fetchBookData, subtopic, category);
        break;

      default:
        result = {
          success: false,
          error: 'Unsupported topic type',
          data: { items: [] },
        };
    }

    if (!result.success) {
      console.error(`[TOPIC_INFO] Failed to fetch ${topic} data:`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          data: { items: [] },
        },
        { status: 200 } // Return 200 for graceful degradation
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[TOPIC_INFO]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        data: { items: [] },
      },
      { status: 200 }
    );
  }
}
