import { useState, useEffect } from 'react';
import { MapPin, Star, Search, Filter, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { TripService } from '../services/tripService';

type Destination = Database['public']['Tables']['destinations']['Row'];

export function TravelGuide() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error loading destinations:', error);
    } else {
      setDestinations(data || []);
    }
    setLoading(false);
  };

  const cities = Array.from(new Set(destinations.map(d => d.city))).sort();
  const categories = Array.from(new Set(destinations.map(d => d.category))).sort();

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      searchQuery === '' ||
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || dest.city === selectedCity;
    return matchesSearch && matchesCategory && matchesCity;
  });

  const addToTrip = async (destinationId: string) => {
    if (!user) {
      showToast('Please sign in to add destinations to your trip', 'warning');
      return;
    }

    const success = await TripService.addDestinationToTrip(user.id, destinationId);
    if (success) {
      showToast('Destination added to My Trip!', 'success');
    } else {
      showToast('This destination is already in your trip', 'info');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      landmark: 'bg-red-100 text-red-700',
      museum: 'bg-purple-100 text-purple-700',
      park: 'bg-green-100 text-green-700',
      attraction: 'bg-blue-100 text-blue-700',
      event: 'bg-amber-100 text-amber-700',
      restaurant: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Tourist exploring famous landmarks"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Discover Amazing Places</h1>
            <p className="text-lg text-white drop-shadow-md">Explore attractions, landmarks, and hidden gems around the world</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading destinations...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <div key={destination.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={destination.image_url || 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-lg ${getCategoryColor(destination.category)}`}>
                      {destination.category.charAt(0).toUpperCase() + destination.category.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{destination.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{destination.city}, {destination.country}</p>
                    </div>
                    {destination.rating && (
                      <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold text-amber-700">{destination.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {destination.description}
                  </p>

                  {destination.address && (
                    <div className="flex items-start text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{destination.address}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToTrip(destination.id)}
                      className="flex-1 bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Trip
                    </button>
                    <button className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredDestinations.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <MapPin className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No destinations found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
