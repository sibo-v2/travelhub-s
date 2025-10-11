import { ArrowUpDown, Check } from 'lucide-react';
import { useState } from 'react';
import { SortBy } from '../../services/discoveryService';

interface DiscoverySortMenuProps {
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
}

export function DiscoverySortMenu({ sortBy, onSortChange }: DiscoverySortMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  const getCurrentLabel = () => {
    return sortOptions.find((opt) => opt.value === sortBy)?.label || 'Sort';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-sky-500 dark:hover:border-sky-500 transition-all"
      >
        <ArrowUpDown className="w-5 h-5" />
        <span className="font-semibold">{getCurrentLabel()}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            <div className="p-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                    sortBy === option.value
                      ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {sortBy === option.value && (
                    <Check className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
