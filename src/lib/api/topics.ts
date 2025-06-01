import axios from 'axios';
import { API_ENDPOINTS, RATE_LIMITS } from '@/config/constants';

// Rate limiting helper
const rateLimiter = new Map<string, number>();

async function withRateLimit(key: string, delay: number, fn: () => Promise<any>) {
  const lastCall = rateLimiter.get(key) || 0;
  const now = Date.now();
  
  if (now - lastCall < delay) {
    await new Promise(resolve => setTimeout(resolve, delay - (now - lastCall)));
  }
  
  rateLimiter.set(key, Date.now());
  return fn();
}

// Anime API
export async function fetchAnimeInfo(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  return withRateLimit('JIKAN_API', RATE_LIMITS.JIKAN_API, async () => {
    try {
      const endpoint = type === 'search'
        ? `${API_ENDPOINTS.JIKAN_API_URL}/anime?q=${query}`
        : type === 'details'
        ? `${API_ENDPOINTS.JIKAN_API_URL}/anime/${query}`
        : `${API_ENDPOINTS.JIKAN_API_URL}/top/anime`;

      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime data:', error);
      return { data: [] };
    }
  });
}

// Games API
export async function fetchGamesInfo(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  return withRateLimit('RAWG_API', RATE_LIMITS.RAWG_API, async () => {
    try {
      const endpoint = `${API_ENDPOINTS.RAWG_API_URL}/games`;
      const params = {
        key: process.env.RAWG_API_KEY,
        search: query,
        ordering: type === 'trending' ? '-rating' : '-released'
      };

      const response = await axios.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching games data:', error);
      return { results: [] };
    }
  });
}

// Movies API
export async function fetchMoviesInfo(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  return withRateLimit('TMDB_API', RATE_LIMITS.TMDB_API, async () => {
    try {
      const endpoint = type === 'search'
        ? `${API_ENDPOINTS.TMDB_API_URL}/search/movie`
        : type === 'details'
        ? `${API_ENDPOINTS.TMDB_API_URL}/movie/${query}`
        : `${API_ENDPOINTS.TMDB_API_URL}/trending/movie/week`;

      const response = await axios.get(endpoint, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query: type === 'search' ? query : undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie data:', error);
      return { results: [] };
    }
  });
}

// Technology API
export async function fetchTechnologyInfo(query?: string) {
  try {
    const endpoint = `${API_ENDPOINTS.GITHUB_API_URL}/search/repositories`;
    const response = await axios.get(endpoint, {
      params: {
        q: query || 'stars:>1000',
        sort: 'stars',
        order: 'desc'
      },
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching technology data:', error);
    return { items: [] };
  }
}

// Books API
export async function fetchBooksInfo(query?: string) {
  try {
    const endpoint = `${API_ENDPOINTS.GOOGLE_BOOKS_API_URL}/volumes`;
    const response = await axios.get(endpoint, {
      params: { q: query || 'subject:programming' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching books data:', error);
    return { items: [] };
  }
}

// Music API
export async function fetchMusicInfo(query?: string) {
  try {
    const endpoint = `${API_ENDPOINTS.SPOTIFY_API_URL}/search`;
    const response = await axios.get(endpoint, {
      params: {
        q: query || 'genre:rock',
        type: 'track,artist'
      },
      headers: {
        Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching music data:', error);
    return { tracks: { items: [] }, artists: { items: [] } };
  }
}
