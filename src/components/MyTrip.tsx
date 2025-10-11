import { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Clock, Receipt, CheckCircle, XCircle, Plane } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { itineraryService, Trip } from '../services/itineraryService';

export function MyTrip() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'bookings'>('itinerary');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      loadTripData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadTripData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const [tripsData, bookingsData] = await Promise.all([
        itineraryService.getUserTrips(user.id),
        bookingService.getUserBookings(user.id).catch(() => []),
      ]);

      const tripsWithDetails = await Promise.all(
        tripsData.map(trip => itineraryService.getTripWithDays(trip.id))
      );

      setTrips(tripsWithDetails);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${days} days)`;
  };

  const calculateTripStats = (trip: Trip) => {
    const totalPlaces = trip.days?.reduce((sum, day) => sum + (day.places?.length || 0), 0) || 0;
    const totalCost = trip.days?.reduce((sum, day) =>
      sum + (day.places?.reduce((daySum, place) => daySum + (place.cost || 0), 0) || 0), 0
    ) || 0;
    const totalDistance = trip.days?.reduce((sum, day) => sum + (day.total_distance || 0), 0) || 0;

    return { totalPlaces, totalCost, totalDistance };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to view your trip
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your personalized travel itinerary
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your trip...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="relative h-[350px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Travel essentials and itinerary planning"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">My Trip</h1>
            <p className="text-lg text-white drop-shadow-md">
              Your personalized travel itinerary
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg mb-8 -mt-20 relative z-10">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'itinerary'
                  ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              My Itinerary ({trips.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'bookings'
                  ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              My Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {activeTab === 'bookings' ? (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <Receipt className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No bookings yet
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your confirmed bookings will appear here
                </p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                          {booking.booking_reference}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.booking_status === 'confirmed'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : booking.booking_status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                        }`}>
                          {booking.booking_status === 'confirmed' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                          {booking.booking_status === 'cancelled' && <XCircle className="inline h-3 w-3 mr-1" />}
                          {booking.booking_status === 'pending' && <Clock className="inline h-3 w-3 mr-1" />}
                          {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.payment_status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          Payment: {booking.payment_status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {booking.service_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {booking.booking_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${booking.total_amount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.number_of_travelers} traveler{booking.number_of_travelers > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Travel Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(booking.travel_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {booking.return_date && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return Date</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {new Date(booking.return_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Booked On</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {booking.contact_email}
                      </p>
                    </div>
                  </div>

                  {booking.booking_passengers && booking.booking_passengers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Passengers</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.booking_passengers.map((passenger: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                          >
                            {passenger.first_name} {passenger.last_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No trips planned yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start planning your next adventure by creating a trip itinerary
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {trips.map((trip) => {
              const stats = calculateTripStats(trip);

              return (
                <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2">{trip.name}</h2>
                        <div className="flex items-center gap-2 text-white/90 mb-1">
                          <MapPin className="w-5 h-5" />
                          <span className="text-lg">{trip.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg">
                        <span className="text-sm font-medium capitalize">{trip.traveler_type} Traveler</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{trip.days?.length || 0}</div>
                        <div className="text-sm text-white/80">Days</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{stats.totalPlaces}</div>
                        <div className="text-sm text-white/80">Places</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">${stats.totalCost.toFixed(0)}</div>
                        <div className="text-sm text-white/80">Est. Cost</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {trip.days && trip.days.length > 0 ? (
                      <div className="space-y-6">
                        {trip.days.map((day) => (
                          <div key={day.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-750 dark:to-gray-700 p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                    {day.day_number}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Day {day.day_number}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {new Date(day.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                {day.places && day.places.length > 0 && (
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{day.places.length} places</span>
                                    </div>
                                    {day.total_distance > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Plane className="w-4 h-4" />
                                        <span>{day.total_distance.toFixed(1)} mi</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {day.places && day.places.length > 0 && (
                              <div className="p-4 space-y-3">
                                {day.places.map((place, index) => (
                                  <div key={place.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-bold">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{place.name}</h4>
                                      {place.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{place.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded capitalize">{place.category}</span>
                                        {place.duration > 0 && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {place.duration} min
                                          </span>
                                        )}
                                        {place.cost > 0 && (
                                          <span className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            ${place.cost}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {(!day.places || day.places.length === 0) && (
                              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No activities planned for this day
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No days planned yet. Visit the Itinerary page to start planning!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
