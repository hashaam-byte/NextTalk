import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API = 'https://api.themoviedb.org/3';

export async function fetchMovieData(query?: string, category?: string) {
  try {
    const endpoint = query
      ? `${TMDB_API}/search/movie`
      : category === 'top'
      ? `${TMDB_API}/movie/top_rated`
      : `${TMDB_API}/movie/popular`;

    const params = {
      api_key: TMDB_API_KEY,
      query: query,
      language: 'en-US'
    };

    const response = await axios.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie data:', error);
    throw error;
  }
}
