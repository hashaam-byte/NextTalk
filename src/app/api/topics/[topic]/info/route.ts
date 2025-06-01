import { NextResponse } from 'next/server';
import { AnimeDetails } from '@/types/topics';

export async function GET(
  req: Request,
  { params }: { params: { topic: string } }
) {
  try {
    const { topic } = params;
    const { searchParams } = new URL(req.url);
    const animeId = searchParams.get('id');

    if (topic === 'anime') {
      // Fetch from MyAnimeList API
      const response = await fetch(
        `https://api.jikan.moe/v4/${animeId ? `anime/${animeId}` : 'top/anime'}`
      );
      const data = await response.json();

      // Format the anime data properly
      const formattedData: AnimeDetails[] = data.data.map((anime: any) => ({
        id: anime.mal_id.toString(),
        title: anime.title,
        episodes: anime.episodes || 0,
        status: anime.status || 'Unknown',
        airingDate: anime.aired?.string || 'Unknown',
        synopsis: anime.synopsis || 'No synopsis available',
        genre: anime.genres?.map((g: any) => g.name) || [],
        rating: anime.score || 0,
        image: anime.images?.jpg?.large_image_url,
        mangaChapters: anime.chapters,
        novelVolumes: anime.volumes,
        relatedContent: {
          manga: anime.related_manga?.map((m: any) => m.title).join(', '),
          adaptations: anime.related_anime?.map((a: any) => a.title)
        },
        streamingPlatforms: anime.streaming || [],
        studios: anime.studios?.map((s: any) => s.name) || [],
        duration: anime.duration,
        source: anime.source,
        year: anime.year,
        season: anime.season,
        popularity: anime.popularity,
        favorites: anime.favorites,
        rank: anime.rank
      }));

      return NextResponse.json({ 
        success: true, 
        data: animeId ? formattedData[0] : formattedData 
      });
    }

    // Handle other topic types...
    return NextResponse.json({ error: 'Topic not supported' }, { status: 400 });

  } catch (error) {
    console.error('[TOPIC_INFO]', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic information' },
      { status: 500 }
    );
  }
}
