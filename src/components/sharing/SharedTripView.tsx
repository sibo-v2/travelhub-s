import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Eye, Calendar, DollarSign, Users, Loader2, AlertCircle } from 'lucide-react';
import { tripSharingService, SharedTrip } from '../../services/tripSharingService';
import { DayItineraryView } from '../itinerary/DayItineraryView';

export function SharedTripView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    if (shareId) {
      loadSharedTrip();
    }
  }, [shareId]);

  const loadSharedTrip = async () => {
    if (!shareId) return;

    setIsLoading(true);
    try {
      const result = await tripSharingService.getSharedTrip(shareId);

      if (result.success && result.trip) {
        setTrip(result.trip);
      } else {
        setError(result.error || 'Trip not found');
      }
    } catch (err) {
      console.error('Error loading shared trip:', err);
      setError('Failed to load trip');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sky-600 dark:text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Trip Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This trip may be private or the link may be invalid.'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const currentDay = trip.tripData.itinerary[currentDayIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-white/80">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Shared Trip</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{trip.title}</h1>

          {trip.description && (
            <p className="text-lg text-white/90 mb-6 max-w-3xl">{trip.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-semibold">Duration</span>
              </div>
              <div className="text-2xl font-bold">
                {trip.tripData.itinerary.length} Days
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-semibold">Budget</span>
              </div>
              <div className="text-2xl font-bold">
                ${trip.tripData.budget.toFixed(0)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-semibold">Travelers</span>
              </div>
              <div className="text-2xl font-bold">{trip.tripData.travelers}</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-semibold">Views</span>
              </div>
              <div className="text-2xl font-bold">{trip.viewCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {trip.tripData.itinerary.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setCurrentDayIndex(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all ${
                  index === currentDayIndex
                    ? 'bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-500'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        <DayItineraryView itinerary={currentDay} destination={trip.tripData.destination} />

        <div className="mt-8 bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Plan Your Own Trip
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Love this itinerary? Create your own personalized trip with our AI-powered trip
            planner!
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md"
          >
            Start Planning
          </a>
        </div>
      </div>
    </div>
  );
}
