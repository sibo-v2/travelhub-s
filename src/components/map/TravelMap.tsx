import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CustomMarker, MarkerData, injectMarkerStyles } from './CustomMarker';
import { MapPopup } from './MapPopup';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { createRoot } from 'react-dom/client';

interface TravelMapProps {
  markers?: MarkerData[];
  routes?: Array<{
    id: string;
    coordinates: [number, number][];
    color?: string;
    animate?: boolean;
  }>;
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
  onMarkerClick?: (marker: MarkerData) => void;
}

export function TravelMap({
  markers = [],
  routes = [],
  initialCenter,
  initialZoom = 10,
  height = '500px',
  onMarkerClick,
}: TravelMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const popupContainer = useRef<HTMLDivElement | null>(null);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);

  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (navigator.geolocation && !initialCenter) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(coords);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to get your location');
          setUserLocation([-74.006, 40.7128]);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setUserLocation(initialCenter || [-74.006, 40.7128]);
      setIsLoadingLocation(false);
    }
  }, [initialCenter]);

  useEffect(() => {
    if (!mapContainer.current || !accessToken || !userLocation) return;

    mapboxgl.accessToken = accessToken;

    injectMarkerStyles();

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation,
      zoom: initialZoom,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (currentPopup.current) {
        currentPopup.current.remove();
      }
      map.current?.remove();
    };
  }, [accessToken, userLocation, initialZoom]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    routes.forEach((route) => {
      const sourceId = `route-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      if (map.current!.getSource(sourceId)) {
        map.current!.removeLayer(layerId);
        map.current!.removeSource(sourceId);
      }

      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
        },
      });

      map.current!.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': route.color || '#0ea5e9',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });

      if (route.animate) {
        animateRoute(route.id, route.coordinates);
      }
    });

    return () => {
      routes.forEach((route) => {
        const sourceId = `route-${route.id}`;
        const layerId = `route-layer-${route.id}`;
        const dashLayerId = `route-dash-layer-${route.id}`;

        if (map.current?.getLayer(dashLayerId)) {
          map.current.removeLayer(dashLayerId);
        }
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
        if (map.current?.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
      });
    };
  }, [routes, mapLoaded]);

  const animateRoute = (routeId: string, coordinates: [number, number][]) => {
    if (!map.current) return;

    const dashLayerId = `route-dash-layer-${routeId}`;
    const sourceId = `route-${routeId}`;

    if (map.current.getLayer(dashLayerId)) {
      map.current.removeLayer(dashLayerId);
    }

    map.current.addLayer({
      id: dashLayerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 3,
        'line-opacity': 0.6,
        'line-dasharray': [0, 4, 3],
      },
    });

    let dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
    ];

    let step = 0;

    function animateDashArray(timestamp: number) {
      if (!map.current || !map.current.getLayer(dashLayerId)) return;

      const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);

      if (newStep !== step) {
        map.current.setPaintProperty(
          dashLayerId,
          'line-dasharray',
          dashArraySequence[newStep]
        );
        step = newStep;
      }

      requestAnimationFrame(animateDashArray);
    }

    animateDashArray(0);
  };

  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);

    if (currentPopup.current) {
      currentPopup.current.remove();
    }

    const popupNode = document.createElement('div');
    const root = createRoot(popupNode);

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25,
      maxWidth: '320px',
    })
      .setLngLat(marker.coordinates)
      .setDOMContent(popupNode)
      .addTo(map.current!);

    root.render(
      <MapPopup
        data={marker}
        onClose={() => {
          popup.remove();
          setSelectedMarker(null);
        }}
      />
    );

    currentPopup.current = popup;

    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: userLocation,
        zoom: 12,
        duration: 1500,
      });
    }
  };

  if (isLoadingLocation) {
    return (
      <div
        className="bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-sky-600 dark:text-sky-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!accessToken || accessToken === 'your_mapbox_access_token_here') {
    return (
      <div
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-center p-6"
        style={{ height }}
      >
        <div className="text-center max-w-md">
          <MapPin className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
            Mapbox Token Required
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Please add your Mapbox access token to the <code className="bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">VITE_MAPBOX_ACCESS_TOKEN</code> environment variable.
          </p>
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Get Mapbox Token
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />

      {mapLoaded && map.current && (
        <>
          {markers.map((marker) => (
            <CustomMarker
              key={marker.id}
              data={marker}
              map={map.current!}
              onClick={handleMarkerClick}
            />
          ))}
        </>
      )}

      {locationError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-50 dark:bg-amber-900/90 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg shadow-lg text-sm">
          {locationError}
        </div>
      )}

      {userLocation && (
        <button
          onClick={centerOnUserLocation}
          className="absolute bottom-24 right-4 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg transition-colors border border-gray-200 dark:border-gray-700"
          title="Center on your location"
        >
          <Navigation className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      <div ref={popupContainer} />
    </div>
  );
}
