import axios from 'axios';

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_API = 'https://api.rawg.io/api';

export async function fetchGameData(query?: string, category?: string) {
  try {
    const endpoint = `${RAWG_API}/games`;
    const params = {
      key: RAWG_API_KEY,
      search: query,
      ordering: category === 'top' ? '-rating' : '-released'
    };

    const response = await axios.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching game data:', error);
    throw error;
  }
}
