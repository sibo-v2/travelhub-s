import { useState, useEffect } from 'react';
import { X, Search, MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { geocodingService } from '../../services/geocodingService';
import { itineraryService } from '../../services/itineraryService';

interface Place {
  id: string;
  name: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  description: string;
  rating: number;
  estimatedCost: number;
  duration: number;
  imageUrl: string;
}

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  destination: string;
  onPlaceAdded: () => void;
}

export function AddPlaceModal({ isOpen, onClose, dayId, destination, onPlaceAdded }: AddPlaceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlaces();
    }
  }, [isOpen, destination]);

  useEffect(() => {
    filterPlaces();
  }, [searchQuery, selectedCategory, places]);

  const loadPlaces = () => {
    const cityName = destination.split(',')[0].trim().toLowerCase();
    const cityPlaces = getPlacesForCity(cityName);
    setPlaces(cityPlaces);
    setFilteredPlaces(cityPlaces);
  };

  const filterPlaces = () => {
    let filtered = places;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlaces(filtered);
  };

  const getPlacesForCity = (city: string): Place[] => {
    const placesData: Record<string, Place[]> = {
      'tokyo': [
        { id: '1', name: 'Senso-ji Temple', category: 'attraction', description: 'Ancient Buddhist temple in Asakusa', rating: 4.6, estimatedCost: 0, duration: 90, imageUrl: 'https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '2', name: 'Tokyo Skytree', category: 'attraction', description: 'World\'s tallest tower with observation decks', rating: 4.5, estimatedCost: 25, duration: 120, imageUrl: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '3', name: 'Meiji Shrine', category: 'attraction', description: 'Peaceful Shinto shrine in forest setting', rating: 4.6, estimatedCost: 0, duration: 75, imageUrl: 'https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '4', name: 'Shibuya Crossing', category: 'attraction', description: 'World\'s busiest pedestrian crossing', rating: 4.7, estimatedCost: 0, duration: 60, imageUrl: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '5', name: 'Ichiran Ramen', category: 'restaurant', description: 'Famous tonkotsu ramen chain', rating: 4.4, estimatedCost: 15, duration: 45, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '6', name: 'Tsukiji Outer Market', category: 'restaurant', description: 'Fresh seafood and street food', rating: 4.5, estimatedCost: 30, duration: 90, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '7', name: 'teamLab Borderless', category: 'activity', description: 'Immersive digital art museum', rating: 4.8, estimatedCost: 35, duration: 150, imageUrl: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '8', name: 'Tokyo DisneySea', category: 'activity', description: 'Unique Disney theme park', rating: 4.8, estimatedCost: 80, duration: 480, imageUrl: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800' },
      ],
      'paris': [
        { id: '9', name: 'Eiffel Tower', category: 'attraction', description: 'Iconic iron lattice tower', rating: 4.7, estimatedCost: 28, duration: 120, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '10', name: 'Louvre Museum', category: 'attraction', description: 'World\'s largest art museum', rating: 4.8, estimatedCost: 17, duration: 180, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '11', name: 'Notre-Dame Cathedral', category: 'attraction', description: 'Medieval Catholic cathedral', rating: 4.7, estimatedCost: 0, duration: 60, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '12', name: 'Cafe de Flore', category: 'restaurant', description: 'Historic Parisian cafe', rating: 4.3, estimatedCost: 45, duration: 90, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '13', name: 'Le Jules Verne', category: 'restaurant', description: 'Fine dining at Eiffel Tower', rating: 4.6, estimatedCost: 200, duration: 120, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '14', name: 'Seine River Cruise', category: 'activity', description: 'Boat tour along the Seine', rating: 4.6, estimatedCost: 15, duration: 75, imageUrl: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800' },
      ],
      'new york': [
        { id: '15', name: 'Statue of Liberty', category: 'attraction', description: 'Iconic symbol of freedom', rating: 4.7, estimatedCost: 24, duration: 180, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '16', name: 'Central Park', category: 'attraction', description: 'Massive urban park', rating: 4.8, estimatedCost: 0, duration: 120, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '17', name: 'Times Square', category: 'attraction', description: 'Bustling commercial intersection', rating: 4.5, estimatedCost: 0, duration: 90, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '18', name: 'Juniors Restaurant', category: 'restaurant', description: 'Famous cheesecake and diner fare', rating: 4.4, estimatedCost: 30, duration: 60, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '19', name: 'Broadway Show', category: 'activity', description: 'World-class theater performance', rating: 4.9, estimatedCost: 150, duration: 180, imageUrl: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800' },
      ],
      'london': [
        { id: '20', name: 'Tower of London', category: 'attraction', description: 'Historic castle with Crown Jewels', rating: 4.7, estimatedCost: 32, duration: 150, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '21', name: 'British Museum', category: 'attraction', description: 'World-famous museum', rating: 4.8, estimatedCost: 0, duration: 150, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '22', name: 'Borough Market', category: 'restaurant', description: 'Historic food market', rating: 4.6, estimatedCost: 25, duration: 90, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { id: '23', name: 'London Eye', category: 'activity', description: 'Giant observation wheel', rating: 4.5, estimatedCost: 35, duration: 60, imageUrl: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800' },
      ],
    };

    return placesData[city] || [
      { id: 'default1', name: `${destination} City Center`, category: 'attraction', description: 'Explore the heart of the city', rating: 4.5, estimatedCost: 0, duration: 90, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
      { id: 'default2', name: `Local Restaurant`, category: 'restaurant', description: 'Authentic local cuisine', rating: 4.3, estimatedCost: 25, duration: 75, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' },
      { id: 'default3', name: `City Museum`, category: 'attraction', description: 'Discover local history and culture', rating: 4.4, estimatedCost: 15, duration: 120, imageUrl: 'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800' },
    ];
  };

  const handleAddPlace = async (place: Place) => {
    setLoading(true);
    try {
      const cityName = destination.split(',')[0].trim();
      const geocodeResult = await geocodingService.geocodePlace(place.name, cityName);

      const newPlace = {
        trip_day_id: dayId,
        position: 0,
        name: place.name,
        category: place.category,
        description: place.description,
        image_url: place.imageUrl,
        hours: 'Open daily',
        cost: place.estimatedCost,
        notes: '',
        latitude: geocodeResult?.latitude || 0,
        longitude: geocodeResult?.longitude || 0,
        address: geocodeResult?.address || '',
        rating: place.rating,
        website: '',
        duration: place.duration,
        visited: false,
        distance_to_next: 0,
        time_to_next: 0,
      };

      await itineraryService.addPlaceToDay(newPlace);
      onPlaceAdded();
      onClose();
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Failed to add place. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Place to Itinerary</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'attraction', 'restaurant', 'activity', 'hotel'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
                  onClick={() => handleAddPlace(place)}
                >
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {place.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {place.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{place.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{place.duration} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>{place.estimatedCost === 0 ? 'Free' : `$${place.estimatedCost}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlaces.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No places found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
