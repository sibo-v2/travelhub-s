import { Plane, MapPin, Car, Globe } from 'lucide-react';
import { ListingsInfo } from './ListingsInfo';
import { ReviewCarousel } from './ReviewCarousel';
import { useAuth } from '../contexts/AuthContext';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const { user } = useAuth();
  const features = [
    {
      icon: Plane,
      title: 'Flight Booking',
      description: 'Compare prices across airlines and classes to find the perfect flight for your journey.',
      page: 'flights',
      color: 'sky',
    },
    {
      icon: Globe,
      title: 'Travel Guide',
      description: 'Discover local attractions, landmarks, and hidden gems at your destination.',
      page: 'guide',
      color: 'emerald',
    },
    {
      icon: Car,
      title: 'Transportation',
      description: 'Book rides, compare prices, and calculate travel time for ground transportation.',
      page: 'transportation',
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div className="relative h-screen overflow-hidden flex items-center justify-center">
        <img
          src="https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Airplane flying above clouds"
          className="absolute inset-0 w-full h-full object-cover animate-slowZoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fadeIn">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl animate-slideDown">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12 drop-shadow-lg animate-slideUp">
            Discover amazing destinations, create unforgettable memories, and travel with confidence
          </p>
          <button
            onClick={() => {
              if (user) {
                onNavigate('traveler-type');
              } else {
                sessionStorage.setItem('redirectAfterLogin', 'traveler-type');
                sessionStorage.setItem('authMessage', 'Please create an account or sign in to start planning your trip. Your personalized itinerary will be saved and accessible across all your devices.');
                onNavigate('signup');
              }
            }}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-12 py-5 rounded-full text-xl font-bold transition-all shadow-2xl hover:shadow-sky-500/50 hover:scale-105 transform animate-bounce-slow"
          >
            Start Planning
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16"></div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.page}
                onClick={() => onNavigate(feature.page)}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div className={`bg-${feature.color}-100 dark:bg-${feature.color}-900 w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                  <Icon className={`h-8 w-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 border border-gray-100 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose TravelHub?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin className="h-6 w-6 text-sky-600 dark:text-sky-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Comprehensive Planning</h4>
                    <p className="text-gray-600 dark:text-gray-300">All your travel needs in one platform</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Plane className="h-6 w-6 text-sky-600 dark:text-sky-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Best Price Guarantee</h4>
                    <p className="text-gray-600 dark:text-gray-300">Compare prices to get the best deals</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Globe className="h-6 w-6 text-sky-600 dark:text-sky-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Expert Recommendations</h4>
                    <p className="text-gray-600 dark:text-gray-300">Curated guides for every destination</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-sky-600 dark:text-sky-400 mb-2">10M+</div>
              <div className="text-gray-700 dark:text-gray-300 text-lg">Travelers Trust Us</div>
              <div className="mt-6 text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">4.8★</div>
              <div className="text-gray-700 dark:text-gray-300">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <ReviewCarousel />

      <ListingsInfo />
    </div>
  );
}
