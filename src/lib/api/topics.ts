import axios from 'axios';
import { API_ENDPOINTS } from '@/config/constants';

const APIs = {
  JIKAN: {
    url: 'https://api.jikan.moe/v4',
    searchEndpoint: '/anime',
    topEndpoint: '/top/anime'
  },
  KITSU: {
    url: 'https://kitsu.io/api/edge',
    searchEndpoint: '/anime',
    topEndpoint: '/trending/anime'
  }
};

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export async function fetchAnimeData(query?: string) {
  const apis = [
    {
      url: APIs.JIKAN.url,
      endpoint: query 
        ? `${APIs.JIKAN.searchEndpoint}?q=${encodeURIComponent(query)}`
        : APIs.JIKAN.topEndpoint,
      transform: (data: any) => ({
        items: data.data?.map((item: any) => ({
          id: item.mal_id?.toString(),
          title: item.title,
          description: item.synopsis,
          image: item.images?.jpg?.large_image_url,
          rating: item.score
        })) || []
      })
    },
    {
      url: APIs.KITSU.url,
      endpoint: query
        ? `${APIs.KITSU.searchEndpoint}?filter[text]=${encodeURIComponent(query)}`
        : APIs.KITSU.topEndpoint,
      transform: (data: any) => ({
        items: data.data?.map((item: any) => ({
          id: item.id,
          title: item.attributes?.canonicalTitle,
          description: item.attributes?.synopsis,
          image: item.attributes?.posterImage?.small,
          rating: item.attributes?.averageRating
        })) || []
      })
    }
  ];

  for (const api of apis) {
    try {
      const response = await axios.get(`${api.url}${api.endpoint}`);
      return api.transform(response.data);
    } catch (error) {
      console.warn(`Failed to fetch from ${api.url}:`, error);
      continue;
    }
  }

  return { items: [] };
}

export async function fetchGameData(query?: string) {
  try {
    const endpoint = `${API_ENDPOINTS.RAWG_API}/games`;
    const response = await axios.get(endpoint, {
      params: {
        key: process.env.RAWG_API_KEY, // <-- Make sure this is set and valid
        search: query,
      }
    });
    return {
      items: response.data.results || [],
      stats: {
        rating: response.data.rating,
        followers: response.data.followers_count,
        posts: response.data.reviews_count
      }
    };
  } catch (error) {
    console.error('Error fetching game data:', error);
    return { items: [], stats: {} };
  }
}

export async function fetchMovieData(query?: string) {
  try {
    const endpoint = query 
      ? `${API_ENDPOINTS.TMDB_API_URL}/search/movie?query=${query}`
      : `${API_ENDPOINTS.TMDB_API_URL}/trending/movie/week`;
    
    const response = await axios.get(endpoint, {
      params: { api_key: process.env.TMDB_API_KEY }
    });
    return {
      items: response.data.results || [],
      stats: {
        rating: response.data.vote_average,
        followers: response.data.popularity,
        posts: response.data.vote_count
      }
    };
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return { items: [], stats: {} };
  }
}

export async function fetchTechData(query?: string) {
  try {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN not configured');
    }

    const [reposResponse, newsResponse] = await Promise.all([
      axios.get(`${API_ENDPOINTS.GITHUB_API}/search/repositories`, {
        params: {
          q: query || 'stars:>1000',
          sort: 'stars',
          order: 'desc'
        },
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }),
      axios.get(`${API_ENDPOINTS.NEWS_API}/everything`, {
        params: {
          q: query || 'technology',
          apiKey: process.env.NEWS_API_KEY
        }
      })
    ]);

    return {
      items: reposResponse.data.items || [],
      news: newsResponse.data.articles || []
    };

  } catch (error) {
    console.error('Error fetching technology data:', error);
    return { items: [], news: [] };
  }
}

export async function fetchMusicData(query?: string) {
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
    return {
      items: response.data.tracks.items || [],
      stats: {
        followers: response.data.artists.items[0]?.followers.total || 0,
        popularity: response.data.tracks.items[0]?.popularity || 0
      }
    };
  } catch (error) {
    console.error('Error fetching music data:', error);
    return { items: [], stats: {} };
  }
}

export async function fetchBookData(query?: string) {
  try {
    const endpoint = `${API_ENDPOINTS.GOOGLE_BOOKS_API_URL}/volumes`;
    const response = await axios.get(endpoint, {
      params: { q: query || 'subject:programming' }
    });
    return {
      items: response.data.items || [],
      stats: {
        totalItems: response.data.totalItems,
        kind: response.data.kind
      }
    };
  } catch (error) {
    console.error('Error fetching books data:', error);
    return { items: [], stats: {} };
  }
}
