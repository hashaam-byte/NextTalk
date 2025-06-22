'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const POPULAR_GAMES = [
	{
		title: 'Free Fire',
		description: 'A popular battle royale mobile game with fast-paced action and survival gameplay.',
		image: '/freefire.jpg', // Colorful Free Fire promotional image
		link: 'https://ff.garena.com/',
	},
	{
		title: 'Call of Duty Mobile',
		description: 'Legendary first-person shooter franchise bringing console-quality gaming to mobile.',
		image: '/call-of-duty-logo.png', // Clean Call of Duty logo
		link: 'https://www.callofduty.com/mobile',
	},
	{
		title: 'Blood Strike',
		description: 'Fast-paced FPS battle royale with intense combat and strategic gameplay.',
		image: '/blood-strike-logo.png', // You'll need to add this image to your public folder
		link: 'https://www.blood-strike.com/m/',
	},
	{
		title: 'PUBG Mobile',
		description: "PlayerUnknown's Battlegrounds - the iconic battle royale that started it all.",
		image: '/pubg.webp', // PUBG Mobile battle scene
		link: 'https://pubg.com/en/main',
	},
	{
		title: 'Dream League Soccer',
		description: 'Build your dream team and compete in the ultimate mobile football experience.',
		image: '/dls25.jpg', // You'll need to add this image
		link: 'https://www.ftgames.com/',
	},
	{
		title: 'FIFA Mobile',
		description: "The world's most popular football video game franchise on mobile devices.",
		image: '/fifa.png', // FIFA Mobile promotional image with players
		link: 'https://www.ea.com/games/fifa/fifa-mobile',
	},
];

export default function PopularGamesPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 px-4 py-8">
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}
				<motion.div 
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
						Popular Mobile Games
					</h1>
					<p className="text-lg text-gray-300 max-w-2xl mx-auto">
						Discover the most exciting mobile games that are taking the world by storm
					</p>
				</motion.div>

				{/* Games Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					{POPULAR_GAMES.map((game, index) => (
						<motion.div
							key={game.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							whileHover={{ scale: 1.02 }}
							className="group"
						>
							<a
								href={game.link}
								target="_blank"
								rel="noopener noreferrer"
								className="block bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden backdrop-blur-sm hover:border-purple-500/30"
							>
								{/* Game Image */}
								<div className="relative h-48 overflow-hidden">
									<Image
										src={game.image}
										alt={game.title}
										fill
										className="object-cover group-hover:scale-110 transition-transform duration-500"
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										priority={index < 3}
									/>
									{/* Overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									
									{/* Play Button Overlay */}
									<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
										<div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
											<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
												<path d="M8 5v14l11-7z"/>
											</svg>
										</div>
									</div>
								</div>

								{/* Game Info */}
								<div className="p-6">
									<h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
										{game.title}
									</h2>
									<p className="text-gray-400 text-sm leading-relaxed">
										{game.description}
									</p>
									
									{/* Action Button */}
									<div className="mt-4 flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
										<span>Play Now</span>
										<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</a>
						</motion.div>
					))}
				</div>

				{/* Call to Action */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.8 }}
					className="text-center"
				>
					<Link
						href="/topics/games"
						className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
					>
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back to All Games
					</Link>
				</motion.div>
			</div>
		</div>
	);
}