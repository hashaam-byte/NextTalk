export interface AnimeDetails {
  id: string;
  title: string;
  episodes: number;
  status: string;
  airingDate: string;
  synopsis: string;
  genre: string[];
  rating: number;
  image?: string;
  mangaChapters?: number;
  novelVolumes?: number;
  relatedContent: {
    manga?: string;
    adaptations?: string[];
  };
  streamingPlatforms?: Array<{
    name: string;
    url: string;
  }>;
  studios?: string[];
  duration?: string;
  source?: string;
  year?: number;
  season?: string;
  popularity?: number;
  favorites?: number;
  rank?: number;
}

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}
