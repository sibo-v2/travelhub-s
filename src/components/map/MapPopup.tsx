import { X, MapPin, Clock, DollarSign, Star, Calendar } from 'lucide-react';
import { MarkerData } from './CustomMarker';

interface MapPopupProps {
  data: MarkerData;
  onClose: () => void;
}

export function MapPopup({ data, onClose }: MapPopupProps) {
  const renderFlightDetails = () => {
    const details = data.details || {};
    return (
      <div className="space-y-3">
        {details.airline && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Airline:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{details.airline}</span>
          </div>
        )}
        {details.flightNumber && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Flight:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{details.flightNumber}</span>
          </div>
        )}
        {details.departureTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-gray-900 dark:text-white">
              {new Date(details.departureTime).toLocaleString()}
            </span>
          </div>
        )}
        {details.price && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ${details.price.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderHotelDetails = () => {
    const details = data.details || {};
    return (
      <div className="space-y-3">
        {details.address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <span className="text-gray-900 dark:text-white">{details.address}</span>
          </div>
        )}
        {details.rating && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-gray-900 dark:text-white">{details.rating} / 5</span>
          </div>
        )}
        {details.pricePerNight && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ${details.pricePerNight} / night
            </span>
          </div>
        )}
        {details.amenities && Array.isArray(details.amenities) && details.amenities.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Amenities: </span>
            <span className="text-gray-900 dark:text-white">
              {details.amenities.slice(0, 3).join(', ')}
              {details.amenities.length > 3 && '...'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderActivityDetails = () => {
    const details = data.details || {};
    return (
      <div className="space-y-3">
        {details.category && (
          <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-full">
            {details.category}
          </div>
        )}
        {details.duration && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-900 dark:text-white">{details.duration}</span>
          </div>
        )}
        {details.date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-900 dark:text-white">
              {new Date(details.date).toLocaleDateString()}
            </span>
          </div>
        )}
        {details.price && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ${details.price.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const getMarkerColor = () => {
    switch (data.type) {
      case 'flight':
        return 'from-sky-500 to-sky-600';
      case 'hotel':
        return 'from-emerald-500 to-emerald-600';
      case 'activity':
        return 'from-amber-500 to-amber-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[280px] max-w-[320px]">
      <div className={`bg-gradient-to-r ${getMarkerColor()} p-4 text-white relative`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-bold text-lg pr-8">{data.title}</h3>
        {data.description && (
          <p className="text-sm opacity-90 mt-1">{data.description}</p>
        )}
      </div>

      <div className="p-4">
        {data.type === 'flight' && renderFlightDetails()}
        {data.type === 'hotel' && renderHotelDetails()}
        {data.type === 'activity' && renderActivityDetails()}

        <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-sky-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-sky-700 hover:to-emerald-700 transition-all text-sm">
          View Details
        </button>
      </div>
    </div>
  );
}
