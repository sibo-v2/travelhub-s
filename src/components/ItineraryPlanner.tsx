import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { itineraryService, Trip } from '../services/itineraryService';
import { ItineraryLeftPanel } from './itinerary/ItineraryLeftPanel';
import { ItineraryMap } from './itinerary/ItineraryMap';

interface ItineraryPlannerProps {
  tripId: string | null;
}

export function ItineraryPlanner({ tripId }: ItineraryPlannerProps) {
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    loadTrip();
  }, [user, tripId]);

  const loadTrip = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (tripId) {
        const fullTrip = await itineraryService.getTripWithDays(tripId);
        setTrip(fullTrip);
      } else {
        const existingTrips = await itineraryService.getUserTrips(user.id);
        if (existingTrips.length > 0) {
          const fullTrip = await itineraryService.getTripWithDays(existingTrips[0].id);
          setTrip(fullTrip);
        }
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceUpdate = async () => {
    if (trip) {
      const updatedTrip = await itineraryService.getTripWithDays(trip.id);
      setTrip(updatedTrip);
    }
  };

  const handlePlaceSelect = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to plan your trip
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to create and manage your travel itinerary
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No trips found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create your first trip to start planning
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row h-full">
        <ItineraryLeftPanel
          trip={trip}
          onPlaceUpdate={handlePlaceUpdate}
          onPlaceSelect={handlePlaceSelect}
          selectedPlaceId={selectedPlaceId}
        />
        <ItineraryMap
          trip={trip}
          selectedPlaceId={selectedPlaceId}
          onPlaceSelect={handlePlaceSelect}
        />
      </div>
    </div>
  );
}
