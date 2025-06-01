import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { topic: string; subtopic?: string } }
) {
  const { topic, subtopic } = params;

  try {
    let data;

    switch (topic) {
      case 'anime':
        // Fetch from MyAnimeList or similar API
        const animeResponse = await fetch(
          `https://api.jikan.moe/v4/anime/${subtopic || 'top'}`
        );
        data = await animeResponse.json();
        break;

      case 'technology':
        // Fetch from GitHub, DEV.to, or similar APIs
        const techResponse = await fetch(
          `https://api.github.com/repos/${subtopic}`
        );
        data = await techResponse.json();
        break;

      case 'sports':
        // Fetch from sports API
        const sportsResponse = await fetch(
          `https://api.sportdata.io/${subtopic}`
        );
        data = await sportsResponse.json();
        break;

      default:
        return NextResponse.json(
          { error: 'Topic not supported' },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching ${topic} data:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch topic data' },
      { status: 500 }
    );
  }
}
