import { 
  Tv, Gamepad, Cpu, Film, BookOpen, Music, Camera, 
  Dumbbell, Globe, Rocket, Coffee, Utensils, PenTool,
  Heart, Users, Brain, Zap, Laptop
} from 'lucide-react';

export const TOPIC_CATEGORIES = [
  {
    id: 'entertainment',
    name: 'Entertainment',
    topics: [
      {
        id: 'anime',
        name: 'Anime & Manga',
        icon: Tv,
        color: 'bg-pink-500/20',
        description: 'Discuss latest episodes, manga chapters & recommendations'
      },
      {
        id: 'gaming',
        name: 'Gaming',
        icon: Gamepad,
        color: 'bg-purple-500/20',
        description: 'Gaming news, reviews & discussions'
      },
      {
        id: 'movies',
        name: 'Movies & TV Shows',
        icon: Film,
        color: 'bg-orange-500/20',
        description: 'Film discussions, TV series & reviews'
      },
      {
        id: 'music',
        name: 'Music',
        icon: Music,
        color: 'bg-blue-500/20',
        description: 'Share music, discuss artists & genres'
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    topics: [
      {
        id: 'programming',
        name: 'Programming',
        icon: Laptop,
        color: 'bg-cyan-500/20',
        description: 'Coding help, projects & tech discussions'
      },
      {
        id: 'gadgets',
        name: 'Gadgets & Tech',
        icon: Cpu,
        color: 'bg-indigo-500/20',
        description: 'Latest devices, reviews & tech news'
      },
      {
        id: 'science',
        name: 'Science & Space',
        icon: Rocket,
        color: 'bg-violet-500/20',
        description: 'Scientific discoveries & space exploration'
      }
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    topics: [
      {
        id: 'fitness',
        name: 'Fitness & Health',
        icon: Dumbbell,
        color: 'bg-green-500/20',
        description: 'Workout tips, nutrition & wellness'
      },
      {
        id: 'food',
        name: 'Food & Cooking',
        icon: Utensils,
        color: 'bg-yellow-500/20',
        description: 'Recipes, cooking tips & food culture'
      },
      {
        id: 'art',
        name: 'Art & Design',
        icon: PenTool,
        color: 'bg-red-500/20',
        description: 'Share artwork, design & creative ideas'
      }
    ]
  },
  {
    id: 'social',
    name: 'Social',
    topics: [
      {
        id: 'relationships',
        name: 'Relationships',
        icon: Heart,
        color: 'bg-rose-500/20',
        description: 'Dating advice & relationship discussions'
      },
      {
        id: 'community',
        name: 'Community',
        icon: Users,
        color: 'bg-emerald-500/20',
        description: 'Meet people with similar interests'
      }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    topics: [
      {
        id: 'learning',
        name: 'Learning & Skills',
        icon: Brain,
        color: 'bg-amber-500/20',
        description: 'Share knowledge & learn new skills'
      },
      {
        id: 'languages',
        name: 'Languages',
        icon: Globe,
        color: 'bg-teal-500/20',
        description: 'Language learning & cultural exchange'
      }
    ]
  }
];
