import { NextResponse } from 'next/server';

// Mock video data generator function
function generateMockVideos() {
  const categories = ['Personal', 'Meetings', 'Entertainment', 'Educational'];
  const creators = ['Alex Johnson', 'Sarah Smith', 'Team Alpha', 'Tech Channel', 'Chris Wong'];
  
  const videoThumbnails = {
    Educational: [
      'https://i3.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/Tn6-PIqc4UM/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg'
    ],
    Entertainment: [
      'https://i3.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg'
    ],
    Meetings: [
      'https://i3.ytimg.com/vi/6_P4LJD-Uwo/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/PDR7YYmxRYk/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/2QoQyCBDjDU/maxresdefault.jpg'
    ],
    Personal: [
      'https://i3.ytimg.com/vi/hoNb6HuNmU0/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/aJ5IzGBnWAc/maxresdefault.jpg',
      'https://i3.ytimg.com/vi/nx2-4l4s4Nw/maxresdefault.jpg'
    ]
  };

  const mockData = [];

  for (let i = 1; i <= 12; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const creator = creators[Math.floor(Math.random() * creators.length)];
    const isLive = Math.random() > 0.8;
    const thumbnails = videoThumbnails[category as keyof typeof videoThumbnails];
    const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)];

    mockData.push({
      id: `video-${i}`,
      title: `${category} Video - ${isLive ? 'LIVE: ' : ''}${i % 3 === 0 ? 'How to use the new features' : i % 2 === 0 ? 'Weekly update meeting' : 'Tutorial session'}`,
      thumbnail: randomThumbnail,
      duration: isLive ? 'LIVE' : `${Math.floor(Math.random() * 59) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
      creator: creator,
      creatorAvatar: `https://i.pravatar.cc/150?img=${i}`,
      dateAdded: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 1000) + 5,
      category: category,
      isLive: isLive
    });
  }

  return mockData;
}

export async function GET() {
  try {
    const videos = generateMockVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
