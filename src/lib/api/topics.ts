import { JIKAN_API_URL, NEWS_API_URL } from '@/config/constants';

export async function fetchAnimeInfo(id?: string) {
  const url = id 
    ? `${JIKAN_API_URL}/anime/${id}`
    : `${JIKAN_API_URL}/top/anime`;
  const response = await fetch(url);
  return response.json();
}

export async function fetchTechNews() {
  const response = await fetch(
    `${NEWS_API_URL}/top-headlines?category=technology&apiKey=${process.env.NEWS_API_KEY}`
  );
  return response.json();
}

// Add more topic-specific fetchers
