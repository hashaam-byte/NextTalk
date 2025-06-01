import axios from 'axios';

const JIKAN_API = 'https://api.jikan.moe/v4';

export async function fetchAnimeData(query?: string, category?: string) {
  try {
    const endpoint = query 
      ? `${JIKAN_API}/anime?q=${query}`
      : category === 'top'
      ? `${JIKAN_API}/top/anime`
      : `${JIKAN_API}/anime/${query}`;

    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime data:', error);
    throw error;
  }
}
