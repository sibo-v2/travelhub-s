import { Plane, Hotel, MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export type MarkerType = 'flight' | 'hotel' | 'activity';

export interface MarkerData {
  id: string;
  type: MarkerType;
  coordinates: [number, number];
  title: string;
  description?: string;
  details?: Record<string, any>;
}

interface CustomMarkerProps {
  data: MarkerData;
  map: mapboxgl.Map;
  onClick?: (data: MarkerData) => void;
}

export function CustomMarker({ data, map, onClick }: CustomMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.cursor = 'pointer';

    const getMarkerIcon = () => {
      switch (data.type) {
        case 'flight':
          return `
            <div class="marker-container flight-marker">
              <div class="marker-pulse"></div>
              <div class="marker-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
                </svg>
              </div>
            </div>
          `;
        case 'hotel':
          return `
            <div class="marker-container hotel-marker">
              <div class="marker-pulse"></div>
              <div class="marker-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2H6c-1 0-2 1-2 2v16c0 1 1 2 2 2h12c1 0 2-1 2-2V4c0-1-1-2-2-2Z"></path>
                  <path d="M8 6h.01"></path>
                  <path d="M16 6h.01"></path>
                  <path d="M8 10h.01"></path>
                  <path d="M16 10h.01"></path>
                  <path d="M8 14h.01"></path>
                  <path d="M16 14h.01"></path>
                  <path d="M8 18h.01"></path>
                  <path d="M16 18h.01"></path>
                </svg>
              </div>
            </div>
          `;
        case 'activity':
          return `
            <div class="marker-container activity-marker">
              <div class="marker-pulse"></div>
              <div class="marker-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
          `;
      }
    };

    el.innerHTML = getMarkerIcon();

    el.addEventListener('click', () => {
      if (onClick) {
        onClick(data);
      }
    });

    const marker = new mapboxgl.Marker(el)
      .setLngLat(data.coordinates)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [data, map, onClick]);

  return null;
}

export function injectMarkerStyles() {
  if (document.getElementById('custom-marker-styles')) return;

  const style = document.createElement('style');
  style.id = 'custom-marker-styles';
  style.textContent = `
    .marker-container {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s ease;
    }

    .marker-container:hover {
      transform: scale(1.15);
      z-index: 10;
    }

    .marker-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      animation: marker-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      pointer-events: none;
    }

    .marker-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
      color: white;
    }

    .flight-marker .marker-pulse {
      background: rgba(14, 165, 233, 0.4);
    }

    .flight-marker .marker-icon {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    }

    .hotel-marker .marker-pulse {
      background: rgba(16, 185, 129, 0.4);
    }

    .hotel-marker .marker-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .activity-marker .marker-pulse {
      background: rgba(245, 158, 11, 0.4);
    }

    .activity-marker .marker-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    @keyframes marker-pulse {
      0%, 100% {
        opacity: 0.5;
        transform: scale(1);
      }
      50% {
        opacity: 0;
        transform: scale(1.5);
      }
    }
  `;
  document.head.appendChild(style);
}
