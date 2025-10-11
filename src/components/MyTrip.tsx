import { useState, useEffect } from 'react';
import { Plane, MapPin, Car, Calendar, Trash2, Edit2, Plus, CheckCircle, Clock, XCircle, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { bookingService } from '../services/bookingService';

export function MyTrip() {
  const { user, loading: authLoading } = useAuth();
  const [flights, setFlights] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [transportation, setTransportation] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'saved' | 'bookings'>('saved');

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
      const [flightsData, destinationsData, transportData, bookingsData] = await Promise.all([
        supabase
          .from('trip_flights')
          .select('*, flights(*)')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false }),
        supabase
          .from('trip_destinations')
          .select('*, destinations(*)')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false }),
        supabase
          .from('trip_transportation')
          .select('*, transportation_bookings(*)')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false }),
        bookingService.getUserBookings(user.id).catch(() => []),
      ]);

      if (flightsData.data) setFlights(flightsData.data);
      if (destinationsData.data) setDestinations(destinationsData.data);
      if (transportData.data) setTransportation(transportData.data);
      if (bookingsData) setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFlight = async (id: string) => {
    await supabase.from('trip_flights').delete().eq('id', id);
    loadTripData();
  };

  const removeDestination = async (id: string) => {
    await supabase.from('trip_destinations').delete().eq('id', id);
    loadTripData();
  };

  const removeTransportation = async (id: string) => {
    await supabase.from('trip_transportation').delete().eq('id', id);
    loadTripData();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  const isEmpty = flights.length === 0 && destinations.length === 0 && transportation.length === 0;

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
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'saved'
                  ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Saved Items
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
                        {new Date(booking.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
        ) : isEmpty ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No items in your trip yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start planning your trip by adding flights, destinations, and transportation
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {flights.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <Plane className="h-6 w-6 text-sky-600 dark:text-sky-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Flights ({flights.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {flights.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.flights.airline}
                            </h3>
                            <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full text-sm font-medium">
                              {item.flights.class_type}
                            </span>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                              {item.booking_status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">{item.flights.origin}</span>
                            <span>→</span>
                            <span className="font-semibold">{item.flights.destination}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(item.flights.departure_time)} - {formatTime(item.flights.arrival_time)}
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              Note: {item.notes}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            Added {formatDate(item.added_at)}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-4">
                            {formatPrice(item.flights.price)}
                          </div>
                          <button
                            onClick={() => removeFlight(item.id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {destinations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Travel Guide ({destinations.length})
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {destinations.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {item.destinations.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {item.destinations.city}, {item.destinations.country}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                              {item.destinations.category}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                              {item.priority}
                            </span>
                          </div>
                          {item.visit_date && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Visit date: {formatDate(item.visit_date)}
                            </div>
                          )}
                          {item.notes && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              Note: {item.notes}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            Added {formatDate(item.added_at)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeDestination(item.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors ml-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transportation.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <Car className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transportation ({transportation.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {transportation.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                              {item.transportation_bookings.service_type}
                            </span>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                              {item.booking_status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">{item.transportation_bookings.origin}</span>
                            <span>→</span>
                            <span className="font-semibold">{item.transportation_bookings.destination}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {item.transportation_bookings.distance_km} km • {item.transportation_bookings.duration_minutes} minutes
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              Note: {item.notes}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            Added {formatDate(item.added_at)}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                            {formatPrice(item.transportation_bookings.total_price)}
                          </div>
                          <button
                            onClick={() => removeTransportation(item.id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trip Summary</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">{flights.length}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1">Flights</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{destinations.length}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1">Destinations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{transportation.length}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1">Transportation</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Estimated Cost</span>
                  <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                    {formatPrice(
                      flights.reduce((sum, item) => sum + item.flights.price, 0) +
                      transportation.reduce((sum, item) => sum + item.transportation_bookings.total_price, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
