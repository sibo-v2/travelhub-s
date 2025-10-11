import { useState, useEffect } from 'react';
import { Building2, MapPin, Star, Search, Calendar, Users, Plus, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { TripService } from '../services/tripService';
import { hotelService } from '../services/hotelService';
import type { Database } from '../lib/database.types';

type Hotel = Database['public']['Tables']['hotels']['Row'];

export function HotelBooking() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numGuests, setNumGuests] = useState(2);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [roomType, setRoomType] = useState('Standard Room');

  useEffect(() => {
    loadHotels();
    checkFlightDestination();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error loading hotels:', error);
    } else {
      setHotels(data || []);
    }
    setLoading(false);
  };

  const checkFlightDestination = async () => {
    if (!user) return;

    const latestFlight = await TripService.getLatestFlightDestination(user.id);
    if (latestFlight) {
      setSearchLocation(latestFlight);
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesLocation = searchLocation === '' || hotel.location.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesLocation;
  });

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotalPrice = (pricePerNight: number) => {
    const nights = calculateNights();
    return nights * pricePerNight;
  };

  const addToTrip = async (hotelId: string) => {
    if (!user) {
      showToast('Please sign in to add hotels to your trip', 'warning');
      return;
    }

    const success = await TripService.addHotelToTrip(user.id, hotelId);
    if (success) {
      showToast('Hotel added to My Trip!', 'success');
    } else {
      showToast('This hotel is already in your trip', 'info');
    }
  };

  const handleBookNow = (hotel: Hotel) => {
    if (!user) {
      showToast('Please sign in to book hotels', 'warning');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      showToast('Please select check-in and check-out dates', 'warning');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      showToast('Check-out date must be after check-in date', 'warning');
      return;
    }

    setSelectedHotel(hotel);
    setShowBookingForm(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedHotel || !user) return;

    const nights = calculateNights();
    const totalPrice = calculateTotalPrice(selectedHotel.price_per_night);

    const bookingData = {
      user_id: user.id,
      hotel_id: selectedHotel.id,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      num_guests: numGuests,
      room_type: roomType,
      total_price: totalPrice,
      status: 'confirmed'
    };

    const success = await hotelService.createHotelBooking(bookingData);

    if (success) {
      showToast(`Hotel booked successfully! Total: $${totalPrice.toFixed(2)} for ${nights} night${nights > 1 ? 's' : ''}`, 'success');
      await addToTrip(selectedHotel.id);
      setShowBookingForm(false);
      setSelectedHotel(null);
    } else {
      showToast('Failed to book hotel. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Book Your Perfect Stay
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find and reserve hotels worldwide with the best rates
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={numGuests}
                  onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading hotels...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900 dark:text-white">{hotel.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{hotel.location}</span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {hotel.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${hotel.price_per_night}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400"> / night</span>
                    </div>
                    {checkInDate && checkOutDate && (
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {calculateNights()} nights
                        </div>
                        <div className="text-lg font-semibold text-sky-600 dark:text-sky-400">
                          ${calculateTotalPrice(hotel.price_per_night).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToTrip(hotel.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 rounded-lg font-medium hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add to Trip</span>
                    </button>
                    <button
                      onClick={() => handleBookNow(hotel)}
                      className="flex-1 px-4 py-2 bg-sky-600 dark:bg-sky-700 text-white rounded-lg font-medium hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredHotels.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No hotels found in this location
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              Try searching for a different destination
            </p>
          </div>
        )}
      </div>

      {showBookingForm && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Your Booking
            </h2>

            <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {selectedHotel.name}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Check-in: {new Date(checkInDate).toLocaleDateString()}</p>
                <p>Check-out: {new Date(checkOutDate).toLocaleDateString()}</p>
                <p>Guests: {numGuests}</p>
                <p>Nights: {calculateNights()}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
              >
                <option>Standard Room</option>
                <option>Deluxe Room</option>
                <option>Suite</option>
                <option>Executive Suite</option>
              </select>
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Price:
                </span>
                <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  ${calculateTotalPrice(selectedHotel.price_per_night).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedHotel(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-sky-600 dark:bg-sky-700 text-white rounded-lg font-medium hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
              >
                <Check className="h-5 w-5" />
                <span>Confirm Booking</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
