import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { ZoomIn } from 'lucide-react';
import { Trip, TripPlace } from '../../services/itineraryService';
import 'leaflet/dist/leaflet.css';

interface ItineraryMapProps {
  trip: Trip;
  selectedPlaceId: string | null;
  onPlaceSelect: (placeId: string) => void;
}

function MapController({ places, selectedPlaceId }: { places: TripPlace[]; selectedPlaceId: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;

    const bounds = new LatLngBounds(
      places
        .filter(p => p.latitude && p.longitude)
        .map(p => [p.latitude!, p.longitude!])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [places, map]);

  useEffect(() => {
    if (selectedPlaceId) {
      const selectedPlace = places.find(p => p.id === selectedPlaceId);
      if (selectedPlace?.latitude && selectedPlace?.longitude) {
        map.setView([selectedPlace.latitude, selectedPlace.longitude], 15, {
          animate: true,
        });
      }
    }
  }, [selectedPlaceId, places, map]);

  return null;
}

function createNumberedIcon(number: number, isSelected: boolean) {
  const color = isSelected ? '#ef4444' : '#3b82f6';
  const svg = `
    <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M18 0C9.163 0 2 7.163 2 16c0 8.837 16 26 16 26s16-17.163 16-26c0-8.837-7.163-16-16-16z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="16" r="11" fill="white"/>
      <text x="18" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${color}">${number}</text>
    </svg>
  `;
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  });
}

export function ItineraryMap({ trip, selectedPlaceId, onPlaceSelect }: ItineraryMapProps) {
  const [showZoomPrompt, setShowZoomPrompt] = useState(false);

  const allPlaces: (TripPlace & { dayNumber: number; position: number })[] = [];
  let globalPosition = 1;

  trip.days?.forEach((day) => {
    day.places?.forEach((place) => {
      if (place.latitude && place.longitude) {
        allPlaces.push({
          ...place,
          dayNumber: day.day_number,
          position: globalPosition++,
        });
      }
    });
  });

  const center: [number, number] = allPlaces.length > 0
    ? [allPlaces[0].latitude!, allPlaces[0].longitude!]
    : [35.6329, 139.8804];

  const polylinePoints: [number, number][] = allPlaces
    .filter(p => p.latitude && p.longitude)
    .map(p => [p.latitude!, p.longitude!]);

  return (
    <div className="w-full lg:w-3/5 h-[500px] lg:h-full relative border-l border-gray-200 dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController places={allPlaces} selectedPlaceId={selectedPlaceId} />

        {polylinePoints.length > 1 && (
          <Polyline
            positions={polylinePoints}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}

        {allPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude!, place.longitude!]}
            icon={createNumberedIcon(place.position, selectedPlaceId === place.id)}
            eventHandlers={{
              click: () => onPlaceSelect(place.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {place.position}
                  </div>
                  <h3 className="font-bold text-gray-900 flex-1">{place.name}</h3>
                </div>

                {place.image_url && (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}

                {place.hours && (
                  <p className="text-xs text-gray-600 mb-1">{place.hours}</p>
                )}

                {place.rating && (
                  <p className="text-xs text-gray-600 mb-2">
                    ⭐ {place.rating.toFixed(1)}
                  </p>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onPlaceSelect(place.id)}
                    className="flex-1 px-3 py-1.5 bg-sky-500 text-white text-xs font-semibold rounded hover:bg-sky-600 transition-colors"
                  >
                    View details
                  </button>
                  {place.latitude && place.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-900 text-xs font-semibold rounded hover:bg-gray-300 transition-colors text-center"
                    >
                      Directions
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {trip.destination}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {allPlaces.length} place{allPlaces.length !== 1 ? 's' : ''} marked
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <button className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700">
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300 mx-auto" />
          </button>
          <button className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 mx-auto"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
