import { NextResponse } from 'next/server';
import { fetchAnimeData } from '@/lib/api/anime';
import { fetchGameData } from '@/lib/api/games';
import { fetchMovieData } from '@/lib/api/movies';
import { fetchTechData } from '@/lib/api/technology';
import { fetchMusicData } from '@/lib/api/music';
import { fetchBookData } from '@/lib/api/books';

export async function GET(
  req: Request,
  { params }: { params: { topic: string } }
) {
  try {
    const { topic } = params;
    const { searchParams } = new URL(req.url);
    const subtopic = searchParams.get('subtopic');
    const category = searchParams.get('category');

    let data;
    switch (topic) {
      case 'anime':
        data = await fetchAnimeData(subtopic, category);
        break;

      case 'games':
        data = await fetchGameData(subtopic, category);
        break;

      case 'movies':
        data = await fetchMovieData(subtopic, category);
        break;

      case 'technology':
        data = await fetchTechData(subtopic, category);
        break;

      case 'music':
        data = await fetchMusicData(subtopic, category);
        break;

      case 'books':
        data = await fetchBookData(subtopic, category);
        break;

      default:
        return NextResponse.json(
          { error: 'Topic not supported' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[TOPIC_INFO]', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic information' },
      { status: 500 }
    );
  }
}
