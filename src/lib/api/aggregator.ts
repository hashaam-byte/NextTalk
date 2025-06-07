import * as TopicAPI from '@/lib/api/topics';

interface TopicData {
  items: any[];
  trending?: any[];
  related?: any[];
  news?: any[];
  stats?: {
    followers?: number;
    posts?: number;
    rating?: number;
  };
}

export async function aggregateTopicData(topic: string, query?: string): Promise<TopicData> {
  try {
    let mainData;
    let additionalData = {};

    switch (topic) {
      case 'anime':
        mainData = await TopicAPI.fetchAnimeData(query);
        break;

      case 'gaming':
      case 'games':
        mainData = await TopicAPI.fetchGameData(query);
        // Merge gaming and games data for backwards compatibility
        additionalData = {
          trending: mainData.trending || [],
          news: mainData.news || []
        };
        break;

      case 'movies':
        mainData = await TopicAPI.fetchMovieData(query);
        break;

      case 'technology':
      case 'programming':
        mainData = await TopicAPI.fetchTechData(query);
        // Include GitHub trending repos for programming
        if (topic === 'programming') {
          additionalData = {
            trending: await TopicAPI.fetchTechData('trending/github')
          };
        }
        break;

      case 'music':
        mainData = await TopicAPI.fetchMusicData(query);
        break;

      case 'books':
        mainData = await TopicAPI.fetchBookData(query);
        break;

      default:
        throw new Error(`Unsupported topic: ${topic}`);
    }

    // Ensure consistent data structure
    return {
      items: Array.isArray(mainData.items) ? mainData.items : [],
      ...additionalData,
      stats: {
        followers: mainData.stats?.followers || 0,
        posts: mainData.stats?.posts || 0,
        rating: mainData.stats?.rating || 0
      }
    };

  } catch (error) {
    console.error(`Error aggregating ${topic} data:`, error);
    return {
      items: [],
      stats: {
        followers: 0,
        posts: 0,
        rating: 0
      }
    };
  }
}
