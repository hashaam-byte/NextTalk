import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function fetchTechData(query?: string, category?: string) {
  try {
    const endpoint = 'https://api.github.com/search/repositories';
    const params = {
      q: query || 'stars:>1000',
      sort: category === 'top' ? 'stars' : 'updated',
      order: 'desc'
    };

    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`
    };

    const response = await axios.get(endpoint, { params, headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching tech data:', error);
    throw error;
  }
}
