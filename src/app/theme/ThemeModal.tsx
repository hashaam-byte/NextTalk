import React, { useState } from 'react';
import { X, CheckCircle, Palette, Loader2 } from 'lucide-react';

const THEME_BUNDLES = [
	{
		id: 'normal',
		name: 'Normal',
		description: 'Original chat style',
		preview: (
			<div className="flex flex-col space-y-2">
				<div className="w-16 h-4 rounded-l-xl rounded-tr-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg" />
				<div className="w-16 h-4 rounded-r-xl rounded-tl-xl bg-white/10 backdrop-blur-sm border border-white/20" />
			</div>
		),
		colors: ['from-purple-600', 'to-indigo-600'],
	},
	{
		id: 'purple-ash',
		name: 'Purple & Ash',
		description: 'Purple for you, ash black for others',
		preview: (
			<div className="flex flex-col space-y-2">
				<div className="w-16 h-4 rounded-l-xl rounded-tr-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-lg" />
				<div className="w-16 h-4 rounded-r-xl rounded-tl-xl bg-neutral-900 border border-neutral-700" />
			</div>
		),
		colors: ['from-purple-500', 'to-fuchsia-600'],
	},
	{
		id: 'blue-green',
		name: 'Blue & Green',
		description: 'Blue for you, green for others',
		preview: (
			<div className="flex flex-col space-y-2">
				<div className="w-16 h-4 rounded-l-xl rounded-tr-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg" />
				<div className="w-16 h-4 rounded-r-xl rounded-tl-xl bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg" />
			</div>
		),
		colors: ['from-blue-500', 'to-cyan-500'],
	},
	{
		id: 'orange-dark',
		name: 'Orange & Dark',
		description: 'Orange for you, dark gray for others',
		preview: (
			<div className="flex flex-col space-y-2">
				<div className="w-16 h-4 rounded-l-xl rounded-tr-xl bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg" />
				<div className="w-16 h-4 rounded-r-xl rounded-tl-xl bg-gray-800 border border-gray-600" />
			</div>
		),
		colors: ['from-orange-500', 'to-pink-500'],
	},
	{
		id: 'emerald-teal',
		name: 'Emerald & Teal',
		description: 'Fresh emerald and teal combination',
		preview: (
			<div className="flex flex-col space-y-2">
				<div className="w-16 h-4 rounded-l-xl rounded-tr-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg" />
				<div className="w-16 h-4 rounded-r-xl rounded-tl-xl bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg" />
			</div>
		),
		colors: ['from-emerald-500', 'to-teal-500'],
	},
	{
		id: 'rose-gold',
		name: 'Rose Gold',
		description: 'Elegant rose gold theme',
		preview: (
			<div className="flex flex-col space-y-2">
				<div className="w-16 h-4 rounded-l-xl rounded-tr-xl bg-gradient-to-r from-rose-400 to-pink-400 shadow-lg" />
				<div className="w-16 h-4 rounded-r-xl rounded-tl-xl bg-gradient-to-r from-amber-200 to-yellow-200 shadow-lg" />
			</div>
		),
		colors: ['from-rose-400', 'to-pink-400'],
	},
];

interface ThemeModalProps {
	isOpen: boolean;
	currentTheme: string;
	onSelect: (themeId: string) => void;
	onClose: () => void;
	chatId: string;
}

const ThemeModal: React.FC<ThemeModalProps> = ({
	isOpen,
	currentTheme,
	onSelect,
	onClose,
	chatId,
}) => {
	const [loading, setLoading] = useState<string | null>(null);

	if (!isOpen) return null;

	const handleThemePick = async (themeId: string) => {
		setLoading(themeId);
		try {
			// Save to backend (to this chat)
			await fetch(`/api/chat/${chatId}/theme`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ theme: themeId }),
			});
			// Inform parent
			onSelect(themeId);
			// Broadcast event for tabs/components sync
			window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: themeId } }));
		} finally {
			setLoading(null);
		}
	};

	return (
		<div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-[6px] flex items-center justify-center p-4 animate-in fade-in duration-200">
			<div
				className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
				style={{
					boxShadow:
						'0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-white/10">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
							<Palette size={20} className="text-purple-400" />
						</div>
						<div>
							<h3 className="text-white font-semibold text-lg">Choose Theme</h3>
							<p className="text-gray-400 text-sm">Customize your chat appearance</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 group"
					>
						<X size={20} className="text-gray-400 group-hover:text-white transition-colors" />
					</button>
				</div>

				{/* Theme Grid */}
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
					<div className="grid grid-cols-1 gap-3">
						{THEME_BUNDLES.map((theme, index) => (
							<button
								key={theme.id}
								onClick={() => handleThemePick(theme.id)}
								disabled={loading !== null}
								className={`group relative flex items-center w-full p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
									currentTheme === theme.id
										? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-blue-500/10 shadow-lg shadow-purple-500/20'
										: 'border-white/10 hover:border-white/20 hover:bg-white/5'
								}`}
								style={{
									animationDelay: `${index * 50}ms`,
									opacity: loading && loading !== theme.id ? 0.7 : 1,
									pointerEvents:
										loading && loading !== theme.id ? 'none' : undefined,
								}}
							>
								{/* Preview */}
								<div className="mr-4 p-2">{theme.preview}</div>

								{/* Content */}
								<div className="flex-1 text-left">
									<div className="text-white font-medium text-base group-hover:text-purple-200 transition-colors">
										{theme.name}
									</div>
									<div className="text-sm text-gray-400 mt-1">
										{theme.description}
									</div>
								</div>

								{/* Selection indicator */}
								<div className="flex items-center">
									{loading === theme.id ? (
										<Loader2 size={20} className="animate-spin text-purple-400" />
									) : currentTheme === theme.id ? (
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
											<CheckCircle size={20} className="text-purple-400" />
										</div>
									) : (
										<div className="w-5 h-5 border-2 border-gray-500 rounded-full group-hover:border-purple-400 transition-colors" />
									)}
								</div>

								{/* Hover effect */}
								<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />
							</button>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-white/10 bg-black/20">
					<p className="text-center text-xs text-gray-500">
						Theme changes apply instantly
					</p>
				</div>
			</div>
		</div>
	);
};

export default ThemeModal;