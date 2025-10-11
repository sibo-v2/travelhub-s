import { useState } from 'react';
import { MapPin, Clock, DollarSign, ExternalLink, ChevronDown, Navigation } from 'lucide-react';
import { TripPlace } from '../../services/itineraryService';

interface PlaceCardProps {
  place: TripPlace;
  position: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: () => void;
}

export function PlaceCard({ place, position, isSelected, onSelect }: PlaceCardProps) {
  const [showDirections, setShowDirections] = useState(false);
  const [notes, setNotes] = useState(place.notes || '');

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
  };

  const formatDistance = (miles: number) => {
    return `${miles.toFixed(2)} mi`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attraction':
        return 'bg-gradient-to-br from-blue-500 to-cyan-500';
      case 'restaurant':
        return 'bg-gradient-to-br from-orange-500 to-red-500';
      case 'hotel':
        return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'activity':
        return 'bg-gradient-to-br from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`relative group cursor-pointer transition-all bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border-2 ${
        isSelected ? 'border-blue-500 shadow-xl scale-[1.02]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-lg'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full ${getCategoryColor(place.category)} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md`}
          >
            {position}
          </div>

          {place.distance_to_next > 0 && (
            <div className="flex-1 flex flex-col items-center py-2">
              <div className="w-0.5 h-full bg-gradient-to-b from-blue-300 to-cyan-300 dark:from-blue-600 dark:to-cyan-600 border-l-2 border-dashed"></div>
            </div>
          )}
        </div>

        <div className="flex-1 pb-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {place.name}
              </h3>

              <div className="flex items-center gap-3 mb-2">
                {place.hours && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{place.hours}</span>
                  </div>
                )}
                {place.rating && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <span className="text-amber-500 text-sm">★</span>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{place.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {place.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3 leading-relaxed">
                  {place.description}
                </p>
              )}

              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes, links, etc. here"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  rows={2}
                  onClick={(e) => e.stopPropagation()}
                />

                {place.cost > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{place.cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </div>
                )}

                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit website</span>
                  </a>
                )}
              </div>

              {place.distance_to_next > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDirections(!showDirections);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>
                      {formatTime(place.time_to_next)} • {formatDistance(place.distance_to_next)}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDirections ? 'rotate-180' : ''}`} />
                  </button>

                  {showDirections && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-sm">
                      <div className="space-y-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${place.latitude},${place.longitude}&destination=${place.latitude},${place.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sky-600 dark:text-sky-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Get directions in Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {place.image_url && (
              <div className="w-64 flex-shrink-0">
                <img
                  src={place.image_url}
                  alt={place.name}
                  className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-all group-hover:scale-105"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
