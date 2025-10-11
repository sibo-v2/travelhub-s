import { useState, useEffect } from 'react';
import { Grid, List, Loader2, Search, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  discoveryService,
  Place,
  DiscoveryFilters,
  SortBy,
} from '../../services/discoveryService';
import { PlaceCard } from './PlaceCard';
import { DiscoveryFilters as FiltersComponent } from './DiscoveryFilters';
import { DiscoverySortMenu } from './DiscoverySortMenu';
import { AISuggestions } from '../AISuggestions';

export function DiscoveryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('Paris, France');
  const [locationInput, setLocationInput] = useState('Paris, France');
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPlaces();
  }, [searchLocation, filters, sortBy]);

  useEffect(() => {
    if (user) {
      loadSavedPlaces();
    }
  }, [user]);

  const loadPlaces = async () => {
    setIsLoading(true);
    try {
      const result = await discoveryService.discoverPlaces(
        searchLocation,
        filters,
        sortBy,
        20
      );

      if (result.success && result.places) {
        setPlaces(result.places);
      } else {
        showToast('Failed to load places', 'error');
      }
    } catch (error) {
      console.error('Error loading places:', error);
      showToast('Failed to load places', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedPlaces = async () => {
    if (!user) return;

    try {
      const result = await discoveryService.getSavedPlaces(user.id);
      if (result.success && result.places) {
        setSavedPlaceIds(new Set(result.places.map((p) => p.id)));
      }
    } catch (error) {
      console.error('Error loading saved places:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLocation(locationInput);
  };

  const handleAddToTrip = async (place: Place) => {
    if (!user) {
      showToast('Please sign in to add places to your trip', 'error');
      return;
    }

    try {
      const result = await discoveryService.addPlaceToTrip(user.id, 'current-trip', place);

      if (result.success) {
        setSavedPlaceIds((prev) => new Set([...prev, place.id]));
        showToast(`${place.name} added to your trip!`, 'success');
      } else {
        showToast('Failed to add place to trip', 'error');
      }
    } catch (error) {
      console.error('Error adding place to trip:', error);
      showToast('Failed to add place to trip', 'error');
    }
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Places
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find amazing restaurants, attractions, and experiences
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter location..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg transition-all"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>

          <AISuggestions
            context={`Looking for places to visit in ${searchLocation}${filters.categories ? `, interested in ${filters.categories.join(', ')}` : ''}`}
            title="Local Recommendations"
            maxSuggestions={4}
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <FiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
              />
              <DiscoverySortMenu sortBy={sortBy} onSortChange={setSortBy} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-sky-600 dark:text-sky-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Discovering amazing places...</p>
            </div>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No places found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search for a different location
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Found {places.length} places in {searchLocation}
            </div>

            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  viewMode={viewMode}
                  onAddToTrip={handleAddToTrip}
                  isAdded={savedPlaceIds.has(place.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
