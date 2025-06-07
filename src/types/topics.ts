export interface BaseTopicDetails {
  id: string;
  title: string;
  description: string;
  image?: string;
  rating?: number;
  tags: string[];
  followers: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnimeDetails extends BaseTopicDetails {
  type: 'anime';
  episodes: number;
  status: string;
  airingDate: string;
  genre: string[];
  mangaChapters?: number;
  novelVolumes?: number;
  studios: string[];
  source: string;
  duration: string;
  season: string;
  relatedContent: {
    manga?: string;
    novel?: string;
    adaptations?: string[];
  };
}

export interface GameDetails extends BaseTopicDetails {
  type: 'game';
  platform: string[];
  developer: string;
  publisher: string;
  releaseDate: string;
  genre: string[];
  averagePlaytime?: number;
  metacriticScore?: number;
  features: string[];
  systemRequirements?: {
    minimum: string;
    recommended: string;
  };
}

export interface MovieDetails extends BaseTopicDetails {
  type: 'movie';
  director: string;
  cast: string[];
  duration: number;
  releaseDate: string;
  genre: string[];
  boxOffice?: string;
  awards?: string[];
  streamingPlatforms: string[];
  relatedMovies?: string[];
}

export interface TechnologyDetails extends BaseTopicDetails {
  type: 'technology';
  category: string;
  company?: string;
  releaseDate: string;
  features: string[];
  techStack?: string[];
  documentation?: string;
  latestVersion?: string;
  githubStats?: {
    stars: number;
    forks: number;
    issues: number;
  };
}

export interface MusicDetails extends BaseTopicDetails {
  type: 'music';
  artist: string;
  album?: string;
  genre: string[];
  releaseDate: string;
  duration: string;
  label: string;
  tracks?: number;
  streamingPlatforms: string[];
  awards?: string[];
}

export interface BookDetails extends BaseTopicDetails {
  type: 'book';
  author: string;
  publisher: string;
  genre: string[];
  releaseDate: string;
  pages: number;
  isbn?: string;
  series?: string;
  awards?: string[];
  formats: string[];
}

export interface TopicItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  url?: string;
  rating?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TopicResponse {
  items: TopicItem[];
  pagination?: {
    hasMore: boolean;
    nextPage?: number;
    total?: number;
  };
}

// Add more topic types as needed...
