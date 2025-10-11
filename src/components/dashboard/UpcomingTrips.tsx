import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Share2, Edit, Trash2 } from 'lucide-react';
import { UserTrip, dashboardService } from '../../services/dashboardService';

interface UpcomingTripsProps {
  trips: UserTrip[];
  onRefresh: () => void;
}

export function UpcomingTrips({ trips, onRefresh }: UpcomingTripsProps) {
  const [countdowns, setCountdowns] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns = new Map();
      trips.forEach((trip) => {
        const countdown = dashboardService.calculateCountdown(trip.startDate);
        newCountdowns.set(trip.id, countdown);
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);

    return () => clearInterval(interval);
  }, [trips]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No upcoming trips
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start planning your next adventure!
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md">
          Plan a Trip
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map((trip) => {
        const countdown = countdowns.get(trip.id);
        const duration = getDuration(trip.startDate, trip.endDate);

        return (
          <div
            key={trip.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{trip.destination}</h3>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(trip.startDate)}</span>
                    </div>
                    <span>•</span>
                    <span>{duration} days</span>
                  </div>
                </div>

                {countdown && !countdown.isPast && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center min-w-[120px]">
                    <div className="text-3xl font-bold mb-1">{countdown.days}</div>
                    <div className="text-xs text-white/80">days to go</div>
                  </div>
                )}
              </div>

              {countdown && !countdown.isPast && countdown.days < 7 && (
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-sm">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Your trip starts in {countdown.days} days, {countdown.hours} hours!
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-sky-100 dark:bg-sky-900/20 rounded-lg">
                    <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Travelers</div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {trip.travelers}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      ${trip.totalCost.toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Bookings</div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {trip.bookings?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {trip.bookings && trip.bookings.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Your Bookings
                  </h4>
                  <div className="space-y-2">
                    {trip.bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {booking.type === 'flight' && '✈️'}
                            {booking.type === 'hotel' && '🏨'}
                            {booking.type === 'activity' && '🎯'}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {booking.name}
                            </div>
                            {booking.bookingReference && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Ref: {booking.bookingReference}
                              </div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                              : booking.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))}
                    {trip.bookings.length > 3 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        +{trip.bookings.length - 3} more bookings
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors">
                  <MapPin className="w-4 h-4" />
                  View Itinerary
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-sky-500 dark:hover:border-sky-500 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-sky-500 dark:hover:border-sky-500 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
