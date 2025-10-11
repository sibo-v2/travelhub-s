import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, MapPin, Eye } from 'lucide-react';
import { UserTrip, dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

export function TripHistory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<UserTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<UserTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: [] as string[],
    minCost: undefined as number | undefined,
    maxCost: undefined as number | undefined,
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, filters, trips]);

  const loadTrips = async () => {
    if (!user) return;

    setIsLoading(true);
    const result = await dashboardService.getUserTrips(user.id);

    if (result.success && result.trips) {
      setTrips(result.trips);
      setFilteredTrips(result.trips);
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!user) return;

    const result = await dashboardService.searchTrips(user.id, searchQuery, filters);

    if (result.success && result.trips) {
      setFilteredTrips(result.trips);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300',
      completed: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
      cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading trip history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips by destination..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
            showFilters || filters.status.length > 0
              ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-500 dark:border-sky-500 text-sky-700 dark:text-sky-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-500 dark:hover:border-sky-500'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="font-semibold">Filters</span>
          {filters.status.length > 0 && (
            <span className="px-2 py-0.5 bg-sky-500 text-white text-xs rounded-full">
              {filters.status.length}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Filter Trips</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Status
              </label>
              <div className="flex gap-2">
                {['upcoming', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                      filters.status.includes(status)
                        ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-500 dark:border-sky-500 text-sky-700 dark:text-sky-300'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-sky-500 dark:hover:border-sky-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Min Cost ($)
                </label>
                <input
                  type="number"
                  value={filters.minCost || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, minCost: parseFloat(e.target.value) || undefined })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Max Cost ($)
                </label>
                <input
                  type="number"
                  value={filters.maxCost || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, maxCost: parseFloat(e.target.value) || undefined })
                  }
                  placeholder="10000"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={() =>
                setFilters({
                  status: [],
                  minCost: undefined,
                  maxCost: undefined,
                  startDate: '',
                  endDate: '',
                })
              }
              className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Travelers
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No trips found</p>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-sky-100 dark:bg-sky-900/20 rounded-lg">
                          <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {trip.destination}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {trip.bookings?.length || 0} bookings
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900 dark:text-white">
                          {formatDate(trip.startDate)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          to {formatDate(trip.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white font-medium">
                        {trip.travelers}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white font-bold">
                        ${trip.totalCost.toFixed(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold text-sm">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTrips.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Showing {filteredTrips.length} of {trips.length} trips
        </div>
      )}
    </div>
  );
}
