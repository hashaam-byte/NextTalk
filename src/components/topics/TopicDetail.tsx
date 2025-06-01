'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, Calendar, Star, Heart, MessageSquare, Share2 } from 'lucide-react';
import Image from 'next/image';

interface AnimeDetails {
  id: string;
  title: string;
  episodes: number;
  status: string;
  airingDate: string;
  synopsis: string;
  genre: string[];
  rating: number;
  mangaChapters?: number;
  novelVolumes?: number;
  relatedContent: {
    manga?: string;
    novel?: string;
    adaptations?: string[];
  };
}

interface TechnologyDetails {
  id: string;
  title: string;
  category: string;
  releaseDate: string;
  description: string;
  features: string[];
  techStack: string[];
  githubStars?: number;
  documentation?: string;
  latestVersion?: string;
}

interface SportDetails {
  id: string;
  title: string;
  league: string;
  season: string;
  standings: Array<{
    team: string;
    position: number;
    points: number;
  }>;
  upcomingMatches: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
  }>;
}

type TopicDetails = AnimeDetails | TechnologyDetails | SportDetails;

export default function TopicDetail() {
  const { topic, subtopic } = useParams();
  const [details, setDetails] = useState<TopicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        const response = await fetch(`/api/topics/${topic}/${subtopic || ''}`);
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Error fetching topic details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicDetails();
  }, [topic, subtopic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Render different layouts based on topic type
  const renderContent = () => {
    switch (topic) {
      case 'anime':
        return renderAnimeContent(details as AnimeDetails);
      case 'technology':
        return renderTechnologyContent(details as TechnologyDetails);
      case 'sports':
        return renderSportsContent(details as SportDetails);
      default:
        return <div>Topic not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white capitalize">{topic}</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Filter size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
}

const renderAnimeContent = (details: AnimeDetails) => {
  if (!details) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Card */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Anime Cover Image */}
            {details.image && (
              <div className="w-full md:w-48 flex-shrink-0">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <Image
                    src={details.image}
                    alt={details.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {details.title}
              </h1>

              {/* Enhanced Status Tags */}
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                  {details.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                  {details.episodes} Episodes
                </span>
                {details.year && (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                    {details.year} {details.season}
                  </span>
                )}
              </div>

              {/* Rating and Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatsCard
                  label="Rating"
                  value={details.rating}
                  icon={Star}
                  color="text-yellow-400"
                />
                <StatsCard
                  label="Rank"
                  value={`#${details.rank}`}
                  icon={Trophy}
                  color="text-purple-400"
                />
                <StatsCard
                  label="Popularity"
                  value={`#${details.popularity}`}
                  icon={Trending}
                  color="text-cyan-400"
                />
                <StatsCard
                  label="Favorites"
                  value={details.favorites?.toLocaleString()}
                  icon={Heart}
                  color="text-red-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Synopsis Card */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Synopsis</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {details.synopsis}
          </p>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Genres */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {details.genre.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm
                           hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Studios */}
          {details.studios && details.studios.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Studios</h2>
              <div className="flex flex-wrap gap-2">
                {details.studios.map((studio) => (
                  <span
                    key={studio}
                    className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm"
                  >
                    {studio}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Info */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Information</h3>
          <dl className="space-y-3">
            <InfoItem label="Type" value={details.source} />
            <InfoItem label="Episodes" value={details.episodes.toString()} />
            <InfoItem label="Duration" value={details.duration} />
            <InfoItem label="Status" value={details.status} />
            <InfoItem label="Aired" value={details.airingDate} />
            {details.mangaChapters && (
              <InfoItem label="Manga Chapters" value={details.mangaChapters.toString()} />
            )}
          </dl>
        </div>

        {/* Streaming Platforms */}
        {details.streamingPlatforms && details.streamingPlatforms.length > 0 && (
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Where to Watch</h3>
            <div className="space-y-2">
              {details.streamingPlatforms.map((platform, index) => (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 
                           hover:bg-white/10 transition-colors group"
                >
                  <span className="text-gray-300 group-hover:text-white">
                    {platform.name}
                  </span>
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const StatsCard = ({ label, value, icon: Icon, color }: StatsCardProps) => (
  <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center">
    <Icon className={`w-5 h-5 ${color} mb-1`} />
    <span className="text-lg font-bold text-white">{value}</span>
    <span className="text-xs text-gray-400">{label}</span>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <dt className="text-gray-400">{label}</dt>
    <dd className="text-white font-medium">{value}</dd>
  </div>
);

const renderTechnologyContent = (details: TechnologyDetails) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Overview */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-3xl font-bold text-white mb-4">{details.title}</h2>
          <div className="flex items-center space-x-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
              {details.category}
            </span>
            {details.latestVersion && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                v{details.latestVersion}
              </span>
            )}
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">
            {details.description}
          </p>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Key Features</h3>
            <ul className="space-y-2">
              {details.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-400 mr-3" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Tech Stack</h3>
          <div className="flex flex-wrap gap-3">
            {details.techStack.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Links */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          {details.documentation && (
            <a
              href={details.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors mb-3"
            >
              <span className="text-gray-300">Documentation</span>
              <Share2 size={16} className="text-gray-400" />
            </a>
          )}
          {details.githubStars !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-300">GitHub Stars</span>
              <div className="flex items-center text-yellow-400">
                <Star size={16} className="mr-1" />
                {details.githubStars.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Release Timeline */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
          <div className="relative pl-4 border-l border-white/10">
            <div className="mb-4">
              <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-purple-400" />
              <p className="text-gray-300">Initial Release</p>
              <p className="text-sm text-gray-400">{details.releaseDate}</p>
            </div>
            {details.latestVersion && (
              <div>
                <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-green-400" />
                <p className="text-gray-300">Latest Version</p>
                <p className="text-sm text-gray-400">v{details.latestVersion}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderSportsContent = (details: SportDetails) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* League Info */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-3xl font-bold text-white mb-4">{details.title}</h2>
          <div className="flex items-center space-x-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
              {details.league}
            </span>
            <span className="text-gray-400">
              {details.season} Season
            </span>
          </div>
        </div>

        {/* Standings */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Standings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-3">Position</th>
                  <th className="text-left py-3">Team</th>
                  <th className="text-right py-3">Points</th>
                </tr>
              </thead>
              <tbody>
                {details.standings.map((standing) => (
                  <tr
                    key={standing.team}
                    className="border-b border-white/5 text-gray-300"
                  >
                    <td className="py-3">{standing.position}</td>
                    <td className="py-3">{standing.team}</td>
                    <td className="py-3 text-right">{standing.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Upcoming Matches */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Upcoming Matches
          </h3>
          <div className="space-y-4">
            {details.upcomingMatches.map((match, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/5"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">{match.homeTeam}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-gray-300">{match.awayTeam}</span>
                </div>
                <div className="text-sm text-gray-400 text-center">
                  {new Date(match.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
