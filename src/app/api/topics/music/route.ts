import { NextResponse } from 'next/server';
import axios from 'axios';

const SPOTIFY_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending';

    const endpoint = filter === 'trending'
      ? 'playlists/37i9dQZEVXbMDoHDwVN2tF' // Global Top 50
      : 'browse/new-releases';

    const response = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${SPOTIFY_TOKEN}`
      }
    });

    const formattedMusic = filter === 'trending'
      ? response.data.tracks.items.map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          image: item.track.album.images[0].url,
          previewUrl: item.track.preview_url,
          spotifyUrl: item.track.external_urls.spotify
        }))
      : response.data.albums.items.map((album: any) => ({
          id: album.id,
          name: album.name,
          artist: album.artists[0].name,
          image: album.images[0].url,
          releaseDate: album.release_date,
          spotifyUrl: album.external_urls.spotify
        }));

    return NextResponse.json({ music: formattedMusic });
  } catch (error) {
    console.error('[MUSIC_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch music content' }, { status: 500 });
  }
}
