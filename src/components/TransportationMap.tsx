import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TransportationMapProps {
  origin?: string;
  destination?: string;
}

function MapUpdater({ origin, destination }: TransportationMapProps) {
  const map = useMap();

  useEffect(() => {
    // Reset view when origin/destination changes
    map.setView([40.7128, -74.0060], 12);
  }, [origin, destination, map]);

  return null;
}

export function TransportationMap({ origin, destination }: TransportationMapProps) {
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // NYC coordinates
  const defaultZoom = 12;

  return (
    <div className="h-96 w-full relative rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {origin && (
          <Marker position={[40.7580, -73.9855]}>
            <Popup>
              <strong>Pickup Location</strong>
              <br />
              {origin}
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[40.6782, -73.9442]}>
            <Popup>
              <strong>Drop-off Location</strong>
              <br />
              {destination}
            </Popup>
          </Marker>
        )}

        <MapUpdater origin={origin} destination={destination} />
      </MapContainer>
    </div>
  );
}
