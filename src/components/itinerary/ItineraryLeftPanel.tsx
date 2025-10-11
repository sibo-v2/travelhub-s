import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Wand2, Plus, MoreVertical, Loader2 } from 'lucide-react';
import { Trip, TripDay } from '../../services/itineraryService';
import { PlaceCard } from './PlaceCard';
import { AddPlaceModal } from './AddPlaceModal';
import { aiItineraryGenerator } from '../../services/aiItineraryGenerator';
import { geocodingService } from '../../services/geocodingService';
import { itineraryService } from '../../services/itineraryService';

interface ItineraryLeftPanelProps {
  trip: Trip;
  onPlaceUpdate: () => void;
  onPlaceSelect: (placeId: string) => void;
  selectedPlaceId: string | null;
}

export function ItineraryLeftPanel({ trip, onPlaceUpdate, onPlaceSelect, selectedPlaceId }: ItineraryLeftPanelProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(trip.days?.map(d => d.id) || []));
  const [loadingDays, setLoadingDays] = useState<Set<string>>(new Set());
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const toggleDay = (dayId: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
  };

  const formatDayName = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDistance = (distance: number) => {
    return distance.toFixed(1);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  const handleAutoFillDay = async (day: TripDay) => {
    setLoadingDays(prev => new Set(prev).add(day.id));

    try {
      const cityName = trip.destination.split(',')[0].trim();
      const places = await aiItineraryGenerator.generateDayItinerary(
        trip.destination,
        day.day_number,
        trip.traveler_type
      );

      const imageUrls = [
        'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
      ];

      for (let i = 0; i < places.length; i++) {
        const place = places[i];

        const geocodeResult = await geocodingService.geocodePlace(place.name, cityName);

        const newPlace = {
          trip_day_id: day.id,
          position: i,
          name: place.name,
          category: place.category,
          description: place.description,
          image_url: imageUrls[i % imageUrls.length],
          hours: `Opens at ${place.startTime}`,
          cost: place.estimatedCost,
          notes: '',
          latitude: geocodeResult?.latitude || 0,
          longitude: geocodeResult?.longitude || 0,
          address: geocodeResult?.address || '',
          rating: place.rating,
          website: '',
          duration: place.duration,
          visited: false,
          distance_to_next: i < places.length - 1 ? 1.5 : 0,
          time_to_next: i < places.length - 1 ? 20 : 0,
        };

        await itineraryService.addPlaceToDay(newPlace);
      }

      onPlaceUpdate();
    } catch (error) {
      console.error('Error auto-filling day:', error);
      alert('Failed to auto-fill day. Please try again.');
    } finally {
      setLoadingDays(prev => {
        const next = new Set(prev);
        next.delete(day.id);
        return next;
      });
    }
  };

  return (
    <div className="w-full lg:w-2/5 h-auto lg:h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 break-words overflow-wrap-anywhere leading-tight">
            {trip.name}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <span className="capitalize">{trip.traveler_type} Traveler</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {trip.days?.map((day, dayIndex) => {
            const isExpanded = expandedDays.has(day.id);

            return (
              <div key={day.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleDay(day.id)}
                      className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                        {day.day_number}
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">Day {day.day_number}</div>
                        <div>{formatDayName(day.date)}</div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 ml-auto" />
                      ) : (
                        <ChevronDown className="w-6 h-6 ml-auto" />
                      )}
                    </button>
                    <button className="p-2.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {isExpanded && (
                    <>
                      <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3">
                        Add subheading
                      </button>

                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => handleAutoFillDay(day)}
                          disabled={loadingDays.has(day.id) || (day.places && day.places.length > 0)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
                        >
                          {loadingDays.has(day.id) ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating itinerary...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4" />
                              Auto-fill day
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDayId(day.id);
                            setShowAddPlaceModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border-2 border-emerald-500 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add place
                        </button>

                        {day.places && day.places.length > 0 && (
                          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatDuration(day.total_duration)}
                            </span>
                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatDistance(day.total_distance)} mi
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {day.places && day.places.length > 0 ? (
                      <>
                        {day.places.map((place, index) => (
                          <PlaceCard
                            key={place.id}
                            place={place}
                            position={index + 1}
                            isSelected={selectedPlaceId === place.id}
                            onSelect={() => onPlaceSelect(place.id)}
                            onUpdate={onPlaceUpdate}
                          />
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No places added yet
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDayId(day.id);
                        setShowAddPlaceModal(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                    >
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add place</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddPlaceModal
        isOpen={showAddPlaceModal}
        onClose={() => setShowAddPlaceModal(false)}
        dayId={selectedDayId || ''}
        destination={trip.destination}
        onPlaceAdded={onPlaceUpdate}
      />
    </div>
  );
}
