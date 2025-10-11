import { useState } from 'react';
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
} from 'lucide-react';
import { Place } from '../../services/discoveryService';

interface PlaceCardProps {
  place: Place;
  viewMode: 'grid' | 'list';
  onAddToTrip: (place: Place) => void;
  isAdded?: boolean;
}

export function PlaceCard({ place, viewMode, onAddToTrip, isAdded }: PlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(place.rating);
    const hasHalfStar = place.rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-amber-400 text-amber-400"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="absolute w-4 h-4 text-gray-300 dark:text-gray-600" />
            <div className="absolute overflow-hidden w-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        );
      }
    }
    return stars;
  };

  const renderPriceLevel = () => {
    return '$'.repeat(place.priceLevel);
  };

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      restaurant: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      cafe: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      bar: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      attraction: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
      museum: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      park: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      shopping: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      entertainment: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return colors[place.category] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="flex gap-4 p-4">
          <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={place.images[currentImageIndex]?.url}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            {place.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {place.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            {place.isOpen !== undefined && (
              <div
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  place.isOpen
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {place.isOpen ? 'Open' : 'Closed'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {place.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryColor()}`}>
                    {place.category}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {renderPriceLevel()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onAddToTrip(place)}
                disabled={isAdded}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isAdded
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                    : 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white shadow-md'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add to Trip
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {renderStars()}
              <span className="ml-1 font-bold text-gray-900 dark:text-white">
                {place.rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({place.reviewCount} reviews)
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {place.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <span className="line-clamp-1">{place.address}</span>
              </div>

              {place.distance !== undefined && (
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{place.distance.toFixed(1)} mi</span> away
                </div>
              )}

              {place.phone && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>{place.phone}</span>
                </div>
              )}

              {place.hours && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="truncate">{place.hours}</span>
                </div>
              )}
            </div>

            {place.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {place.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative h-56 overflow-hidden">
        <img
          src={place.images[currentImageIndex]?.url}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        {place.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {place.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        {place.isOpen !== undefined && (
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
              place.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
            }`}
          >
            {place.isOpen ? 'Open' : 'Closed'}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
            {place.name}
          </h3>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
            {renderPriceLevel()}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {renderStars()}
          <span className="ml-1 font-bold text-gray-900 dark:text-white text-sm">
            {place.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({place.reviewCount})
          </span>
        </div>

        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize mb-3 ${getCategoryColor()}`}>
          {place.category}
        </span>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {place.description}
        </p>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="line-clamp-1">{place.address}</span>
          </div>

          {place.distance !== undefined && (
            <div className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{place.distance.toFixed(1)} mi</span> away
            </div>
          )}
        </div>

        <button
          onClick={() => onAddToTrip(place)}
          disabled={isAdded}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            isAdded
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
              : 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white shadow-md'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              Added to Trip
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
}
