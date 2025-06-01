import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending';
    const type = searchParams.get('type') || 'movie'; // movie or tv

    const endpoint = filter === 'trending'
      ? `trending/${type}/week`
      : `discover/${type}`;

    const response = await axios.get(`https://api.themoviedb.org/3/${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        sort_by: filter === 'popular' ? 'popularity.desc' : 'release_date.desc'
      }
    });

    const formattedContent = response.data.results.map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      overview: item.overview,
      releaseDate: item.release_date || item.first_air_date,
      poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      rating: item.vote_average,
      type: type
    }));

    return NextResponse.json({ content: formattedContent });
  } catch (error) {
    console.error('[MOVIES_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch movies/shows' }, { status: 500 });
  }
}
