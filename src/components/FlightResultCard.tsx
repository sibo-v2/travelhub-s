import { Plane, Clock, MapPin } from 'lucide-react';
import { FlightResult, FlightResultsService } from '../services/flightResultsService';

interface FlightResultCardProps {
  flight: FlightResult;
  onSelect: (flight: FlightResult) => void;
}

export function FlightResultCard({ flight, onSelect }: FlightResultCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDepartureHour = () => {
    return new Date(flight.departureTime).getHours();
  };

  const getTimeOfDay = () => {
    const hour = getDepartureHour();
    if (hour >= 6 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 24) return 'Evening';
    return 'Night';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {flight.airline}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {flight.flightNumber} • {flight.cabinClass.charAt(0).toUpperCase() + flight.cabinClass.slice(1)}
                </p>
              </div>
            </div>
            {flight.stops === 0 && (
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                Non-stop
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {FlightResultsService.formatTime(flight.departureTime)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {flight.origin}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {FlightResultsService.formatDate(flight.departureTime)} • {getTimeOfDay()}
              </div>
            </div>

            <div className="flex flex-col items-center px-4 flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {FlightResultsService.formatDuration(flight.duration)}
              </div>
              <div className="relative w-full">
                <div className="h-0.5 bg-gray-300 dark:bg-gray-600 w-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Plane className="w-4 h-4 text-gray-400 dark:text-gray-500 rotate-90" />
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </div>
              {flight.stopCities && flight.stopCities.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  via {flight.stopCities.join(', ')}
                </div>
              )}
            </div>

            <div className="flex-1 text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {FlightResultsService.formatTime(flight.arrivalTime)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {flight.destination}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {FlightResultsService.formatDate(flight.arrivalTime)}
              </div>
            </div>
          </div>

          {flight.layoverDuration && flight.layoverDuration > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <span>
                Layover: {FlightResultsService.formatDuration(flight.layoverDuration)}
              </span>
            </div>
          )}
        </div>

        <div className="lg:border-l lg:border-gray-200 dark:border-gray-700 lg:pl-6 flex flex-col items-center lg:items-end gap-3">
          <div className="text-center lg:text-right">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
              {formatPrice(flight.price)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              per person
            </div>
            {flight.availableSeats <= 5 && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                Only {flight.availableSeats} seats left!
              </div>
            )}
          </div>

          <button
            onClick={() => onSelect(flight)}
            className="w-full lg:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Select Flight
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Free cancellation
          </div>
        </div>
      </div>
    </div>
  );
}
