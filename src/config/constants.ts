export const API_ENDPOINTS = {
  JIKAN_API: 'https://api.jikan.moe/v4',
  MAL_API: 'https://api.myanimelist.net/v2',
  BACKUP_ANIME_API: 'https://kitsu.io/api/edge',
  RAWG_API: 'https://api.rawg.io/api',
  TMDB_API: 'https://api.themoviedb.org/3',
  GITHUB_API: 'https://api.github.com',
  SPOTIFY_API: 'https://api.spotify.com/v1',
  GOOGLE_BOOKS_API: 'https://www.googleapis.com/books/v1',
  NEWS_API: 'https://newsapi.org/v2',
  WIKI_API: 'https://en.wikipedia.org/api/rest_v1'
};

export const RATE_LIMITS = {
  JIKAN_API: 1000, // 1 second between requests
  RAWG_API: 500,   // 0.5 seconds between requests
  TMDB_API: 250    // 0.25 seconds between requests
};

export const API_CONFIG = {
  TIMEOUT: 5000,
  RETRIES: 3,
  POOL_TIMEOUT: 30000
};
