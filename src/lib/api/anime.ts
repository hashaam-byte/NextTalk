import axios from 'axios';

const JIKAN_API = 'https://api.jikan.moe/v4';
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests

export async function fetchAnimeData(query?: string, category?: string) {
  try {
    // Add delay to respect rate limiting
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

    let endpoint = '';
    let params = {};

    if (query) {
      // Search for specific anime
      endpoint = `${JIKAN_API}/anime`;
      params = { q: query };
    } else if (category === 'top') {
      // Get top anime
      endpoint = `${JIKAN_API}/top/anime`;
    } else {
      // Get seasonal anime as default
      endpoint = `${JIKAN_API}/seasons/now`;
    }

    const response = await axios.get(endpoint, {
      params,
      validateStatus: (status) => status < 500, // Accept 404 responses
    });

    // Handle 404 or empty responses
    if (response.status === 404 || !response.data) {
      return {
        data: [],
        pagination: {
          current_page: 1,
          has_next_page: false
        }
      };
    }

    // Format the response data
    return {
      data: response.data.data.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        synopsis: anime.synopsis,
        episodes: anime.episodes,
        status: anime.status,
        airingDate: anime.aired?.string,
        genre: anime.genres?.map((g: any) => g.name) || [],
        rating: anime.score,
        image: anime.images?.jpg?.large_image_url,
        trailer: anime.trailer?.url,
        studios: anime.studios?.map((s: any) => s.name) || [],
        source: anime.source,
        duration: anime.duration,
        season: anime.season,
        year: anime.year,
        popularity: anime.popularity,
        rank: anime.rank,
        members: anime.members,
        favorites: anime.favorites
      })),
      pagination: response.data.pagination
    };

  } catch (error) {
    console.error('Error fetching anime data:', error);
    return {
      data: [],
      pagination: {
        current_page: 1,
        has_next_page: false
      },
      error: 'Failed to fetch anime data'
    };
  }
}
