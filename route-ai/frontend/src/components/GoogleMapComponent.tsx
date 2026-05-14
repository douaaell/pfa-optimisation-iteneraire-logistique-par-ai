import React, { useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '24px'
};

const center = { lat: 33.5731, lng: -7.5898 }; // Casablanca

const options = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] }
  ],
  disableDefaultUI: true,
  zoomControl: true,
};

interface MapProps {
  directions?: google.maps.DirectionsResult | null;
  markers?: Array<{ id: number | string; lat: number; lng: number; label?: string; type?: 'driver' | 'delivery' }>;
  centerPos?: { lat: number; lng: number };
  zoom?: number;
}

const GoogleMapComponent: React.FC<MapProps> = ({ directions, markers, centerPos, zoom = 12 }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places']
  });

  if (!isLoaded) return <div className="w-full h-full bg-slate-900 animate-pulse rounded-3xl" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={centerPos || center}
      zoom={zoom}
      options={options}
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: { strokeColor: '#6366f1', strokeWeight: 5, strokeOpacity: 0.8 },
          }}
        />
      )}

      {markers?.map((m) => (
        <Marker
          key={m.id}
          position={{ lat: m.lat, lng: m.lng }}
          icon={m.type === 'driver' ? 'http://maps.google.com/mapfiles/ms/icons/truck.png' : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'}
        />
      ))}
    </GoogleMap>
  );
};

export default React.memo(GoogleMapComponent);
