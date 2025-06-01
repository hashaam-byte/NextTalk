import { NextResponse } from 'next/server';
import axios from 'axios';

const RAWG_API_KEY = process.env.RAWG_API_KEY;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending';

    const response = await axios.get(`https://api.rawg.io/api/games`, {
      params: {
        key: RAWG_API_KEY,
        ordering: filter === 'trending' ? '-metacritic' : '-released',
        page_size: 20
      }
    });

    const formattedGames = response.data.results.map((game: any) => ({
      id: game.id,
      title: game.name,
      releaseDate: game.released,
      image: game.background_image,
      platforms: game.platforms?.map((p: any) => p.platform.name),
      rating: game.metacritic,
      genres: game.genres?.map((g: any) => g.name),
      description: game.description_raw
    }));

    return NextResponse.json({ games: formattedGames });
  } catch (error) {
    console.error('[GAMES_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
