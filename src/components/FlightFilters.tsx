import { useState, useEffect } from 'react';
import { Filter, X, DollarSign, Plane, Clock, MapPin } from 'lucide-react';
import { FlightFilters as FlightFiltersType } from '../services/flightResultsService';

interface FlightFiltersProps {
  availableAirlines: string[];
  priceRange: [number, number];
  onFiltersChange: (filters: Partial<FlightFiltersType>) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function FlightFilters({
  availableAirlines,
  priceRange,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
}: FlightFiltersProps) {
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>(priceRange);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedDepartureTimes, setSelectedDepartureTimes] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setSelectedPriceRange(priceRange);
  }, [priceRange]);

  useEffect(() => {
    onFiltersChange({
      priceRange: selectedPriceRange,
      airlines: selectedAirlines,
      departureTime: selectedDepartureTimes,
      stops: selectedStops,
    });
  }, [selectedPriceRange, selectedAirlines, selectedDepartureTimes, selectedStops]);

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...selectedPriceRange] as [number, number];
    newRange[index] = value;
    if (newRange[0] <= newRange[1]) {
      setSelectedPriceRange(newRange);
    }
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    );
  };

  const toggleDepartureTime = (time: string) => {
    setSelectedDepartureTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const toggleStops = (stops: number) => {
    setSelectedStops((prev) =>
      prev.includes(stops) ? prev.filter((s) => s !== stops) : [...prev, stops]
    );
  };

  const handleClearAll = () => {
    setSelectedPriceRange(priceRange);
    setSelectedAirlines([]);
    setSelectedDepartureTimes([]);
    setSelectedStops([]);
    onClearFilters();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const departureTimeOptions = [
    { value: 'morning', label: 'Morning', time: '6 AM - 12 PM', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', time: '12 PM - 6 PM', icon: '☀️' },
    { value: 'evening', label: 'Evening', time: '6 PM - 12 AM', icon: '🌆' },
    { value: 'night', label: 'Night', time: '12 AM - 6 AM', icon: '🌙' },
  ];

  const stopsOptions = [
    { value: 0, label: 'Non-stop' },
    { value: 1, label: '1 Stop' },
    { value: 2, label: '2+ Stops' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full text-xs font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Price Range</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Min</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(selectedPriceRange[0])}
                </span>
              </div>
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={selectedPriceRange[0]}
                onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Max</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(selectedPriceRange[1])}
                </span>
              </div>
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={selectedPriceRange[1]}
                onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Stops</h3>
            </div>
            <div className="space-y-2">
              {stopsOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedStops.includes(option.value)}
                    onChange={() => toggleStops(option.value)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Departure Time</h3>
            </div>
            <div className="space-y-2">
              {departureTimeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDepartureTimes.includes(option.value)}
                      onChange={() => toggleDepartureTime(option.value)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white">
                          {option.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                        {option.time}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Airlines</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableAirlines.map((airline) => (
                <label
                  key={airline}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(airline)}
                    onChange={() => toggleAirline(airline)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {airline}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
