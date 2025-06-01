import axios from 'axios';

export const API_ENDPOINTS = {
  anime: {
    base: 'https://api.jikan.moe/v4',
    search: '/anime',
    details: '/anime/{id}',
    trending: '/top/anime',
  },
  games: {
    base: 'https://api.rawg.io/api',
    search: '/games',
    details: '/games/{id}',
    trending: '/games/lists/trending',
  },
  movies: {
    base: 'https://api.themoviedb.org/3',
    search: '/search/movie',
    details: '/movie/{id}',
    trending: '/trending/movie/week',
  },
  technology: {
    base: 'https://api.github.com',
    trending: '/search/repositories',
    details: '/repos/{owner}/{repo}',
  },
  music: {
    base: 'https://api.spotify.com/v1',
    search: '/search',
    details: '/tracks/{id}',
    trending: '/playlists/37i9dQZEVXbMDoHDwVN2tF',
  },
  books: {
    base: 'https://www.googleapis.com/books/v1',
    search: '/volumes',
    details: '/volumes/{id}',
  },
};

// Anime API Fetcher
export async function fetchAnimeData(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  try {
    const endpoint = type === 'search' 
      ? `${API_ENDPOINTS.anime.base}${API_ENDPOINTS.anime.search}?q=${query}`
      : type === 'details'
      ? `${API_ENDPOINTS.anime.base}${API_ENDPOINTS.anime.details.replace('{id}', query || '')}`
      : `${API_ENDPOINTS.anime.base}${API_ENDPOINTS.anime.trending}`;

    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime data:', error);
    throw error;
  }
}

// Games API Fetcher
export async function fetchGameData(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  try {
    const endpoint = type === 'search'
      ? `${API_ENDPOINTS.games.base}${API_ENDPOINTS.games.search}?key=${process.env.RAWG_API_KEY}&search=${query}`
      : type === 'details'
      ? `${API_ENDPOINTS.games.base}${API_ENDPOINTS.games.details.replace('{id}', query || '')}?key=${process.env.RAWG_API_KEY}`
      : `${API_ENDPOINTS.games.base}${API_ENDPOINTS.games.trending}?key=${process.env.RAWG_API_KEY}`;

    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching game data:', error);
    throw error;
  }
}

// Movies API Fetcher
export async function fetchMovieData(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  try {
    const endpoint = type === 'search'
      ? `${API_ENDPOINTS.movies.base}${API_ENDPOINTS.movies.search}?api_key=${process.env.TMDB_API_KEY}&query=${query}`
      : type === 'details'
      ? `${API_ENDPOINTS.movies.base}${API_ENDPOINTS.movies.details.replace('{id}', query || '')}?api_key=${process.env.TMDB_API_KEY}`
      : `${API_ENDPOINTS.movies.base}${API_ENDPOINTS.movies.trending}?api_key=${process.env.TMDB_API_KEY}`;

    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie data:', error);
    throw error;
  }
}

// Technology API Fetcher
export async function fetchTechData(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  try {
    const endpoint = type === 'search'
      ? `${API_ENDPOINTS.technology.base}/search/repositories?q=${query}`
      : type === 'details'
      ? `${API_ENDPOINTS.technology.base}${API_ENDPOINTS.technology.details.replace('{owner}', query?.split('/')[0] || '').replace('{repo}', query?.split('/')[1] || '')}`
      : `${API_ENDPOINTS.technology.base}${API_ENDPOINTS.technology.trending}?q=stars:>1000&sort=stars`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tech data:', error);
    throw error;
  }
}

// Music API Fetcher
export async function fetchMusicData(query?: string, type: 'search' | 'details' | 'trending' = 'trending') {
  try {
    const endpoint = type === 'search'
      ? `${API_ENDPOINTS.music.base}${API_ENDPOINTS.music.search}?q=${query}&type=track`
      : type === 'details'
      ? `${API_ENDPOINTS.music.base}${API_ENDPOINTS.music.details.replace('{id}', query || '')}`
      : `${API_ENDPOINTS.music.base}${API_ENDPOINTS.music.trending}`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching music data:', error);
    throw error;
  }
}

// Books API Fetcher
export async function fetchBookData(query?: string, type: 'search' | 'details' = 'search') {
  try {
    const endpoint = type === 'search'
      ? `${API_ENDPOINTS.books.base}${API_ENDPOINTS.books.search}?q=${query}`
      : `${API_ENDPOINTS.books.base}${API_ENDPOINTS.books.details.replace('{id}', query || '')}`;

    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching book data:', error);
    throw error;
  }
}

// Common Types
export interface TopicResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Error Handler
export function handleTopicError(error: any): TopicResponse<null> {
  console.error('Topic API Error:', error);
  return {
    success: false,
    data: null,
    error: error.response?.data?.message || 'An error occurred while fetching data'
  };
}
