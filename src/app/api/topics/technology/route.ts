import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending';
    
    // Fetch GitHub trending repositories
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'stars:>1000',
        sort: filter === 'trending' ? 'stars' : 'updated',
        order: 'desc',
        per_page: 20
      },
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });

    const formattedRepos = response.data.items.map((repo: any) => ({
      id: repo.id,
      name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      topics: repo.topics,
      updatedAt: repo.updated_at
    }));

    // Also fetch tech news if available
    const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'technology',
        language: 'en',
        apiKey: process.env.NEWS_API_KEY
      }
    });

    return NextResponse.json({
      repositories: formattedRepos,
      news: newsResponse.data.articles
    });
  } catch (error) {
    console.error('[TECHNOLOGY_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch tech content' }, { status: 500 });
  }
}
