import { useState } from 'react';
import { Car, MapPin, Clock, DollarSign, Navigation, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { TripService } from '../services/tripService';
import { TransportationMap } from './TransportationMap';

interface RouteCalculation {
  distance: number;
  duration: number;
  basePrice: number;
  totalPrice: number;
}

export function Transportation() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [serviceType, setServiceType] = useState<'standard' | 'premium' | 'shared'>('standard');
  const [calculation, setCalculation] = useState<RouteCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string>('');

  const serviceTypes = [
    {
      id: 'standard' as const,
      name: 'Standard',
      description: 'Comfortable rides at affordable prices',
      priceMultiplier: 1.0,
      icon: Car,
      color: 'blue',
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      description: 'Luxury vehicles with professional drivers',
      priceMultiplier: 1.8,
      icon: Car,
      color: 'purple',
    },
    {
      id: 'shared' as const,
      name: 'Shared',
      description: 'Save money by sharing your ride',
      priceMultiplier: 0.6,
      icon: Car,
      color: 'green',
    },
  ];

  const calculateRoute = () => {
    if (!origin || !destination) {
      alert('Please enter both origin and destination');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const baseDistance = Math.random() * 30 + 5;
      const baseDuration = Math.floor(baseDistance * 2.5 + Math.random() * 10);
      const basePricePerKm = 2.5;
      const selectedService = serviceTypes.find(s => s.id === serviceType);
      const multiplier = selectedService?.priceMultiplier || 1.0;

      const basePrice = baseDistance * basePricePerKm;
      const serviceFee = 5;
      const totalPrice = basePrice * multiplier + serviceFee;

      setCalculation({
        distance: Math.round(baseDistance * 10) / 10,
        duration: baseDuration,
        basePrice: Math.round(basePrice * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
      });

      setLoading(false);
    }, 1000);
  };

  const bookRide = async () => {
    if (!calculation) return;

    setLoading(true);
    setBookingStatus('');

    const { error } = await supabase
      .from('transportation_bookings')
      .insert({
        service_type: serviceType,
        origin,
        destination,
        distance_km: calculation.distance,
        duration_minutes: calculation.duration,
        base_price: calculation.basePrice,
        total_price: calculation.totalPrice,
        status: 'confirmed',
      });

    if (error) {
      setBookingStatus('Error booking ride. Please try again.');
      console.error('Booking error:', error);
    } else {
      setBookingStatus('Ride booked successfully!');
      setTimeout(() => {
        setOrigin('');
        setDestination('');
        setCalculation(null);
        setBookingStatus('');
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1319840/pexels-photo-1319840.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Modern car on scenic road"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Book Your Ride</h1>
            <p className="text-lg text-white drop-shadow-md">Fast, reliable transportation to get you where you need to go</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Plan Your Journey</h2>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Trip Details</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Enter pickup address"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drop-off Location</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Enter destination address"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Service Type</label>
                <div className="space-y-3">
                  {serviceTypes.map((service) => {
                    const Icon = service.icon;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setServiceType(service.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          serviceType === service.id
                            ? `border-${service.color}-500 bg-${service.color}-50`
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className={`h-6 w-6 mr-3 ${serviceType === service.id ? `text-${service.color}-600` : 'text-gray-400 dark:text-gray-500'}`} />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">{service.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{service.description}</div>
                          </div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {service.priceMultiplier}x
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={calculateRoute}
                disabled={loading || !origin || !destination}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Calculate Route
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>

            {calculation && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Route Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">Distance</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{calculation.distance} km</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">Estimated Time</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{calculation.duration} min</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">Base Fare</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">${calculation.basePrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                    <div className="flex items-center">
                      <DollarSign className="h-6 w-6 text-amber-600 mr-3" />
                      <span className="font-bold text-gray-900 dark:text-white">Total Price</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-600">${calculation.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={bookRide}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>

                {bookingStatus && (
                  <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                    bookingStatus.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {bookingStatus}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <TransportationMap origin={origin} destination={destination} />
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Navigation className="h-4 w-4 mr-2 text-amber-600" />
                  <span>Interactive map showing service area and route planning</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Why Choose Us?</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Quick Pickup</h4>
                  <p className="text-gray-600 dark:text-gray-300">Average wait time of less than 5 minutes</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-emerald-100 rounded-lg p-3 mr-4">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Transparent Pricing</h4>
                  <p className="text-gray-600 dark:text-gray-300">No hidden fees, see the exact price before you book</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 rounded-lg p-3 mr-4">
                  <Car className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Professional Drivers</h4>
                  <p className="text-gray-600 dark:text-gray-300">Verified, licensed drivers with excellent ratings</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 rounded-lg p-3 mr-4">
                  <Navigation className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Real-time Tracking</h4>
                  <p className="text-gray-600 dark:text-gray-300">Track your ride in real-time for peace of mind</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Special Offer!</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Get 20% off your first ride with code: WELCOME20</p>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-600 text-center">
                <code className="text-amber-600 dark:text-amber-400 font-bold text-lg">WELCOME20</code>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
