import axios from 'axios';

const API_ENDPOINTS = {
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
  // Add new API endpoints
  YOUTUBE_API: 'https://www.googleapis.com/youtube/v3',
  REDDIT_API: 'https://www.reddit.com/r',
  STACKEXCHANGE_API: 'https://api.stackexchange.com/2.3',
  WIKIPEDIA_API: 'https://en.wikipedia.org/api/rest_v1',
  TWITTER_API: 'https://api.twitter.com/2',
};

async function fetchWithRetry(fetcher: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetcher();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function fetchTopicData(topic: string, subtopic?: string) {
  const data = {
    mainContent: [],
    discussions: [],
    news: [],
    relatedContent: [],
    trending: []
  };

  try {
    // Fetch main content based on topic
    switch (topic) {
      case 'anime':
        const [animeInfo, animeNews, animeDiscussions] = await Promise.all([
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.JIKAN_API}/anime/${subtopic || 'top'}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.NEWS_API}/everything?q=anime ${subtopic || ''}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.REDDIT_API}/anime/search.json?q=${subtopic || ''}`))
        ]);
        data.mainContent = animeInfo.data;
        data.news = animeNews.data.articles;
        data.discussions = animeDiscussions.data.data.children;
        break;

      case 'gaming':
        const [gameInfo, gameNews, gameDiscussions] = await Promise.all([
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.RAWG_API}/games?key=${process.env.RAWG_API_KEY}&search=${subtopic || ''}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.NEWS_API}/everything?q=gaming ${subtopic || ''}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.REDDIT_API}/gaming/search.json?q=${subtopic || ''}`))
        ]);
        data.mainContent = gameInfo.data.results;
        data.news = gameNews.data.articles;
        data.discussions = gameDiscussions.data.data.children;
        break;

      case 'programming':
        const [githubRepos, stackOverflow, techNews] = await Promise.all([
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.GITHUB_API}/search/repositories?q=${subtopic || 'stars:>10000'}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.STACKEXCHANGE_API}/questions?site=stackoverflow&tagged=${subtopic || 'javascript'}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.NEWS_API}/everything?q=programming ${subtopic || ''}`))
        ]);
        data.mainContent = githubRepos.data.items;
        data.discussions = stackOverflow.data.items;
        data.news = techNews.data.articles;
        break;

      case 'movies':
        const [movieInfo, movieNews, movieDiscussions] = await Promise.all([
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.TMDB_API}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${subtopic || ''}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.NEWS_API}/everything?q=movies ${subtopic || ''}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.REDDIT_API}/movies/search.json?q=${subtopic || ''}`))
        ]);
        data.mainContent = movieInfo.data.results;
        data.news = movieNews.data.articles;
        data.discussions = movieDiscussions.data.data.children;
        break;

      case 'music':
        const [musicInfo, musicNews, musicDiscussions] = await Promise.all([
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.SPOTIFY_API}/search?q=${subtopic || ''}&type=track,artist,album`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.NEWS_API}/everything?q=music ${subtopic || ''}`)),
          fetchWithRetry(() => axios.get(`${API_ENDPOINTS.REDDIT_API}/music/search.json?q=${subtopic || ''}`))
        ]);
        data.mainContent = musicInfo.data;
        data.news = musicNews.data.articles;
        data.discussions = musicDiscussions.data.data.children;
        break;

      // Add more topic handlers as needed
    }

    // Fetch trending content for the topic
    const trendingResponse = await fetchWithRetry(() => 
      axios.get(`${API_ENDPOINTS.NEWS_API}/everything?q=${topic}&sortBy=popularity`)
    );
    data.trending = trendingResponse.data.articles;

    // Fetch Wikipedia summary if available
    try {
      const wikiResponse = await axios.get(
        `${API_ENDPOINTS.WIKIPEDIA_API}/page/summary/${subtopic || topic}`
      );
      data.relatedContent.push({
        type: 'wiki',
        content: wikiResponse.data.extract,
        url: wikiResponse.data.content_urls?.desktop?.page
      });
    } catch (error) {
      console.warn('Wikipedia fetch failed:', error);
    }

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error(`Error fetching ${topic} data:`, error);
    return {
      success: false,
      error: 'Failed to fetch topic data',
      data
    };
  }
}

export function transformTopicData(data: any, topic: string) {
  // Transform data based on topic type
  switch (topic) {
    case 'anime':
      return transformAnimeData(data);
    case 'gaming':
      return transformGamingData(data);
    case 'programming':
      return transformProgrammingData(data);
    // Add more transformers as needed
    default:
      return data;
  }
}

// Add data transformer functions
function transformAnimeData(data: any) {
  // Transform anime data
}

function transformGamingData(data: any) {
  // Transform gaming data
}

function transformProgrammingData(data: any) {
  // Transform programming data
}
