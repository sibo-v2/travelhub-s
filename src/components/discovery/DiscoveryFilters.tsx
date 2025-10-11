import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { PlaceCategory, PriceLevel, DiscoveryFilters as Filters } from '../../services/discoveryService';

interface DiscoveryFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

export function DiscoveryFilters({ filters, onFiltersChange, onReset }: DiscoveryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories: { value: PlaceCategory; label: string; icon: string }[] = [
    { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { value: 'cafe', label: 'Cafes', icon: '☕' },
    { value: 'bar', label: 'Bars', icon: '🍺' },
    { value: 'attraction', label: 'Attractions', icon: '🎯' },
    { value: 'museum', label: 'Museums', icon: '🏛️' },
    { value: 'park', label: 'Parks', icon: '🌳' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  ];

  const priceLevels: { value: PriceLevel; label: string; symbol: string }[] = [
    { value: 1, label: 'Budget', symbol: '$' },
    { value: 2, label: 'Moderate', symbol: '$$' },
    { value: 3, label: 'Expensive', symbol: '$$$' },
    { value: 4, label: 'Luxury', symbol: '$$$$' },
  ];

  const toggleCategory = (category: PlaceCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, category: updated.length > 0 ? updated : undefined });
  };

  const togglePriceLevel = (level: PriceLevel) => {
    const current = filters.priceLevel || [];
    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    onFiltersChange({ ...filters, priceLevel: updated.length > 0 ? updated : undefined });
  };

  const hasActiveFilters = () => {
    return (
      (filters.category && filters.category.length > 0) ||
      (filters.priceLevel && filters.priceLevel.length > 0) ||
      filters.minRating !== undefined ||
      filters.maxDistance !== undefined ||
      filters.isOpen !== undefined
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          hasActiveFilters()
            ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-500 dark:border-sky-500 text-sky-700 dark:text-sky-300'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-500 dark:hover:border-sky-500'
        }`}
      >
        <Filter className="w-5 h-5" />
        <span className="font-semibold">Filters</span>
        {hasActiveFilters() && (
          <span className="px-2 py-0.5 bg-sky-500 text-white text-xs rounded-full">
            {[
              filters.category?.length || 0,
              filters.priceLevel?.length || 0,
              filters.minRating ? 1 : 0,
              filters.maxDistance ? 1 : 0,
              filters.isOpen !== undefined ? 1 : 0,
            ].reduce((a, b) => a + b, 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
              {hasActiveFilters() && (
                <button
                  onClick={() => {
                    onReset();
                    setIsOpen(false);
                  }}
                  className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                        filters.category?.includes(cat.value)
                          ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-500 dark:border-sky-500 text-sky-700 dark:text-sky-300'
                          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-500 dark:hover:border-sky-500'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => togglePriceLevel(level.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm ${
                        filters.priceLevel?.includes(level.value)
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-500'
                      }`}
                    >
                      <span className="font-medium">{level.label}</span>
                      <span className="font-bold">{level.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Minimum Rating
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating || 0}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minRating: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Any</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {filters.minRating ? `${filters.minRating}+ ⭐` : 'Any'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">5⭐</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Maximum Distance
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.maxDistance || 10}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      maxDistance: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">0 mi</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {filters.maxDistance ? `${filters.maxDistance} miles` : 'Any distance'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">10 mi</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isOpen || false}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        isOpen: e.target.checked ? true : undefined,
                      })
                    }
                    className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Open Now
                  </span>
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
