export const API_ENDPOINTS = {
  JIKAN_API_URL: 'https://api.jikan.moe/v4',
  RAWG_API_URL: 'https://api.rawg.io/api',
  TMDB_API_URL: 'https://api.themoviedb.org/3',
  NEWS_API_URL: 'https://newsapi.org/v2',
  SPOTIFY_API_URL: 'https://api.spotify.com/v1',
  GITHUB_API_URL: 'https://api.github.com',
  GOOGLE_BOOKS_API_URL: 'https://www.googleapis.com/books/v1'
};

export const RATE_LIMITS = {
  JIKAN_API: 1000, // 1 second between requests
  RAWG_API: 500,   // 0.5 seconds between requests
  TMDB_API: 250    // 0.25 seconds between requests
};
