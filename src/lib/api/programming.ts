import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function fetchProgrammingData(query?: string, category: string = 'trending') {
  try {
    const endpoint = 'https://api.github.com/search/repositories';
    
    const params: any = {
      q: query || 'stars:>1000',
      sort: category === 'trending' ? 'stars' : 'updated',
      order: 'desc',
      per_page: 20
    };

    if (!query) {
      // Add language filters for trending
      params.q += ' language:typescript language:javascript language:python language:java language:cpp';
    }

    const response = await axios.get(endpoint, {
      params,
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    return {
      items: response.data.items.map((repo: any) => ({
        id: repo.id.toString(),
        title: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        topics: repo.topics,
        updatedAt: repo.updated_at
      }))
    };
  } catch (error) {
    console.error('Error fetching programming data:', error);
    throw error;
  }
}
