import { useState } from 'react';
import { TravelMap } from './TravelMap';
import { MarkerData } from './CustomMarker';
import { Plane, Hotel, MapPin } from 'lucide-react';

export function TravelMapDemo() {
  const [markers] = useState<MarkerData[]>([
    {
      id: 'flight-1',
      type: 'flight',
      coordinates: [-73.9352, 40.7306],
      title: 'JFK Airport',
      description: 'New York',
      details: {
        airline: 'American Airlines',
        flightNumber: 'AA 100',
        departureTime: new Date('2025-10-15T10:00:00').toISOString(),
        price: 450,
      },
    },
    {
      id: 'flight-2',
      type: 'flight',
      coordinates: [-118.4085, 33.9416],
      title: 'LAX Airport',
      description: 'Los Angeles',
      details: {
        airline: 'American Airlines',
        flightNumber: 'AA 100',
        departureTime: new Date('2025-10-15T15:00:00').toISOString(),
        price: 450,
      },
    },
    {
      id: 'hotel-1',
      type: 'hotel',
      coordinates: [-118.2437, 34.0522],
      title: 'Grand Hotel LA',
      description: 'Luxury Downtown Hotel',
      details: {
        address: '123 Main St, Los Angeles, CA',
        rating: 4.8,
        pricePerNight: 250,
        amenities: ['Pool', 'Gym', 'Spa', 'Restaurant', 'Bar'],
      },
    },
    {
      id: 'hotel-2',
      type: 'hotel',
      coordinates: [-118.3, 34.1],
      title: 'Beach Resort',
      description: 'Oceanfront Paradise',
      details: {
        address: '456 Beach Blvd, Santa Monica, CA',
        rating: 4.6,
        pricePerNight: 320,
        amenities: ['Beach Access', 'Pool', 'Spa'],
      },
    },
    {
      id: 'activity-1',
      type: 'activity',
      coordinates: [-118.3, 34.0],
      title: 'Hollywood Sign Tour',
      description: 'Guided hiking tour',
      details: {
        category: 'Sightseeing',
        duration: '3 hours',
        date: new Date('2025-10-16T09:00:00').toISOString(),
        price: 75,
      },
    },
    {
      id: 'activity-2',
      type: 'activity',
      coordinates: [-118.4912, 34.0195],
      title: 'Santa Monica Pier',
      description: 'Beach activities & entertainment',
      details: {
        category: 'Entertainment',
        duration: '4 hours',
        date: new Date('2025-10-17T14:00:00').toISOString(),
        price: 50,
      },
    },
  ]);

  const [routes] = useState([
    {
      id: 'flight-route',
      coordinates: [
        [-73.9352, 40.7306],
        [-100.0, 38.0],
        [-118.4085, 33.9416],
      ] as [number, number][],
      color: '#0ea5e9',
      animate: true,
    },
    {
      id: 'ground-route',
      coordinates: [
        [-118.4085, 33.9416],
        [-118.2437, 34.0522],
        [-118.3, 34.1],
        [-118.3, 34.0],
        [-118.4912, 34.0195],
      ] as [number, number][],
      color: '#10b981',
      animate: true,
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Travel Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View all your flights, hotels, and activities on an interactive map
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg">
          <Plane className="w-8 h-8 mb-2" />
          <div className="text-3xl font-bold mb-1">2</div>
          <div className="text-sm opacity-90">Flights</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <Hotel className="w-8 h-8 mb-2" />
          <div className="text-3xl font-bold mb-1">2</div>
          <div className="text-sm opacity-90">Hotels</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-lg">
          <MapPin className="w-8 h-8 mb-2" />
          <div className="text-3xl font-bold mb-1">2</div>
          <div className="text-sm opacity-90">Activities</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <TravelMap
          markers={markers}
          routes={routes}
          initialZoom={4}
          height="600px"
          onMarkerClick={(marker) => {
            console.log('Marker clicked:', marker);
          }}
        />
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
          Map Features
        </h3>
        <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
          <li>• Click on markers to view detailed information</li>
          <li>• Animated flight paths show your journey</li>
          <li>• Use navigation controls to zoom and pan</li>
          <li>• Click the location button to center on your position</li>
        </ul>
      </div>
    </div>
  );
}
