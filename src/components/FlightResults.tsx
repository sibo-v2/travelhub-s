import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingDown, Zap, Award, ChevronLeft, ChevronRight, Filter as FilterIcon } from 'lucide-react';
import {
  FlightResultsService,
  FlightSearchParams,
  FlightResult,
  FlightFilters as FlightFiltersType,
  SortOption,
} from '../services/flightResultsService';
import { FlightResultCard } from './FlightResultCard';
import { FlightFilters } from './FlightFilters';
import { FlightSearchSkeleton } from './FlightSearchSkeleton';

interface FlightResultsProps {
  searchParams: FlightSearchParams;
  onBack: () => void;
  onSelectFlight: (flight: FlightResult) => void;
}

export function FlightResults({ searchParams, onBack, onSelectFlight }: FlightResultsProps) {
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [filters, setFilters] = useState<Partial<FlightFiltersType>>({});
  const [availableAirlines, setAvailableAirlines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadFlights();
  }, [currentPage, sortBy, filters]);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const response = await FlightResultsService.searchFlights(
        searchParams,
        currentPage,
        filters,
        sortBy
      );
      setResults(response.results);
      setTotalPages(response.totalPages);
      setTotalResults(response.total);

      if (currentPage === 1 && Object.keys(filters).length === 0) {
        const allResults = await FlightResultsService.searchFlights(searchParams, 1, {}, sortBy);
        const airlines = FlightResultsService.getAvailableAirlines(allResults.results);
        const range = FlightResultsService.getPriceRange(allResults.results);
        setAvailableAirlines(airlines);
        setPriceRange(range);
      }
    } catch (error) {
      console.error('Error loading flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<FlightFiltersType>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.airlines && filters.airlines.length > 0) count += filters.airlines.length;
    if (filters.departureTime && filters.departureTime.length > 0) count += filters.departureTime.length;
    if (filters.stops && filters.stops.length > 0) count += filters.stops.length;
    if (filters.priceRange && (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1])) count += 1;
    return count;
  };

  const sortOptions = [
    { value: 'cheapest', label: 'Cheapest', icon: TrendingDown, description: 'Lowest price first' },
    { value: 'fastest', label: 'Fastest', icon: Zap, description: 'Shortest duration' },
    { value: 'best', label: 'Best Value', icon: Award, description: 'Recommended' },
  ];

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {searchParams.origin} → {searchParams.destination}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {searchParams.departureDate?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {searchParams.tripType === 'roundtrip' && searchParams.returnDate && (
                  <> - {searchParams.returnDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">{totalResults}</span> flights found
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FilterIcon className="w-4 h-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value as SortOption)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    sortBy === option.value
                      ? 'bg-sky-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`w-80 flex-shrink-0 ${showMobileFilters ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent' : 'hidden lg:block'}`}>
            <div className={`${showMobileFilters ? 'absolute right-0 top-0 bottom-0 w-80 overflow-y-auto' : ''}`}>
              <FlightFilters
                availableAirlines={availableAirlines}
                priceRange={priceRange}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                activeFiltersCount={getActiveFiltersCount()}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <FlightSearchSkeleton />
            ) : results.length > 0 ? (
              <>
                <div className="space-y-4">
                  {results.map((flight) => (
                    <FlightResultCard
                      key={flight.id}
                      flight={flight}
                      onSelect={onSelectFlight}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        disabled={page === '...'}
                        className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                          page === currentPage
                            ? 'bg-sky-600 text-white shadow-lg'
                            : page === '...'
                            ? 'cursor-default text-gray-400 dark:text-gray-500'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, totalResults)} of {totalResults} flights
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No flights found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
