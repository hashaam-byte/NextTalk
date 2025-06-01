import axios from 'axios';
import { getSpotifyToken } from '@/lib/spotify';

export async function fetchMusicData(query?: string, category?: string) {
  try {
    const token = await getSpotifyToken();
    if (!token) throw new Error('Failed to get Spotify token');

    const endpoint = query
      ? 'https://api.spotify.com/v1/search'
      : 'https://api.spotify.com/v1/browse/new-releases';

    const params = query ? {
      q: query,
      type: 'track,album',
      limit: 20
    } : undefined;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching music data:', error);
    throw error;
  }
}
