import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Filter, X, Clock, Star, Heart, Bookmark, TrendingUp, MapPin, Plane, Car } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SearchService, SearchFilters, SearchResults } from '../services/searchService';

export function Search() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'flights' | 'destinations' | 'transportation'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    priceRange: { min: 0, max: 10000 },
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (user) {
      loadRecentSearches();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const loadSuggestions = async () => {
    const suggestions = await SearchService.getSearchSuggestions(searchQuery);
    setSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const loadRecentSearches = async () => {
    if (!user) return;
    const recent = await SearchService.getRecentSearches(user.id);
    setRecentSearches(recent);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    const searchFilters: SearchFilters = {
      query: searchQuery,
      category,
      ...filters,
    };

    const searchResults = await SearchService.performSearch(searchFilters, user?.id);
    setResults(searchResults);
    setLoading(false);

    if (user) {
      loadRecentSearches();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleRecentSearchClick = (search: any) => {
    setSearchQuery(search.search_query);
    setCategory(search.search_type);
    if (search.filters) {
      setFilters(search.filters);
    }
    handleSearch();
  };

  const handleSaveSearch = async () => {
    if (!user || !searchQuery) return;
    const name = prompt('Name this search:');
    if (name) {
      await SearchService.saveSearch(user.id, name, {
        query: searchQuery,
        category,
        ...filters,
      });
      alert('Search saved successfully!');
    }
  };

  const toggleFavorite = async (itemType: string, itemId: string) => {
    if (!user) return;
    await SearchService.toggleFavorite(user.id, itemType, itemId);
    handleSearch();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Person planning travel with map and compass"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Search Your Perfect Trip
            </h1>
            <p className="text-lg text-white drop-shadow-md">
              Find flights, destinations, and transportation all in one place
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 -mt-24 relative z-10">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {['all', 'flights', 'destinations', 'transportation'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative">
              <SearchIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search destinations, flights, or transportation..."
                className="w-full pl-12 pr-32 py-4 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-2 flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <TrendingUp className="h-4 w-4 mr-3 text-sky-600 dark:text-sky-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {showFilters && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange?.min || 0}
                        onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange!, min: Number(e.target.value) } })}
                        className="w-full px-3 py-2 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange?.max || 10000}
                        onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange!, max: Number(e.target.value) } })}
                        className="w-full px-3 py-2 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy || 'relevance'}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                      className="w-full px-3 py-2 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price">Price</option>
                      <option value="rating">Rating</option>
                      <option value="duration">Duration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order
                    </label>
                    <select
                      value={filters.sortOrder || 'desc'}
                      onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                      className="w-full px-3 py-2 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                {user && (
                  <button
                    onClick={handleSaveSearch}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center"
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save This Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {user && recentSearches.length > 0 && !results && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-sky-600 dark:text-sky-400" />
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleRecentSearchClick(search)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {search.search_query} ({search.search_type})
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Searching across all categories...</p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Found {results.totalResults} results for "{searchQuery}"
              </p>
            </div>

            {results.flights.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Plane className="h-5 w-5 mr-2 text-sky-600 dark:text-sky-400" />
                  Flights ({results.flights.length})
                </h3>
                <div className="space-y-4">
                  {results.flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              {flight.airline}
                            </h4>
                            <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full text-sm font-medium">
                              {flight.class_type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">{flight.origin}</span>
                            <span>→</span>
                            <span className="font-semibold">{flight.destination}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(flight.departure_time)} - {formatTime(flight.arrival_time)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-2">
                            {formatPrice(flight.price)}
                          </div>
                          <button
                            onClick={() => user && toggleFavorite('flight', flight.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.destinations.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Destinations ({results.destinations.length})
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.destinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {dest.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {dest.city}, {dest.country}
                            </p>
                          </div>
                          <button
                            onClick={() => user && toggleFavorite('destination', dest.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          {dest.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                            {dest.category}
                          </span>
                          <div className="flex items-center text-amber-500">
                            <Star className="h-4 w-4 mr-1 fill-current" />
                            <span className="font-semibold">{dest.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.transportation.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                  Transportation ({results.transportation.length})
                </h3>
                <div className="space-y-4">
                  {results.transportation.map((transport) => (
                    <div
                      key={transport.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium mb-2 inline-block">
                            {transport.service_type}
                          </span>
                          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 mt-2">
                            <span className="font-semibold">{transport.origin}</span>
                            <span>→</span>
                            <span className="font-semibold">{transport.destination}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {transport.distance_km} km • {transport.duration_minutes} minutes
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {formatPrice(transport.total_price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.totalResults === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <SearchIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
