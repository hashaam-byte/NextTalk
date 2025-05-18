'use client';

interface FiltersComponentProps {
  onFilterSelect: (filter: string) => void;
  selectedFilter: string;
}

export default function FiltersComponent({ onFilterSelect, selectedFilter }: FiltersComponentProps) {
  const filters = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Blur', value: 'blur(2px)' },
    { name: 'Brightness', value: 'brightness(150%)' },
    { name: 'Contrast', value: 'contrast(200%)' }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto p-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterSelect(filter.value)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedFilter === filter.value
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          {filter.name}
        </button>
      ))}
    </div>
  );
}