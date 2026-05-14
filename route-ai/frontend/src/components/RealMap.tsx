import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface RealMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  markers?: Array<{
    position: [number, number];
    label: string;
  }>;
  polylines?: Array<{
    positions: Array<[number, number]>;
    color?: string;
  }>;
}

export const RealMap: React.FC<RealMapProps> = ({ 
  center = [33.5731, -7.5898], 
  zoom = 6,
  className = "",
  markers = [],
  polylines = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);

  // 1. Initialisation unique de la carte
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current;
    if ((container as any)._leaflet_id) {
       (container as any)._leaflet_id = null;
    }

    const map = L.map(container, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png').addTo(map);
    
    layersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Une seule fois au montage

  // 2. Mise à jour de la vue (Center/Zoom)
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  // 3. Mise à jour des données (Markers/Polylines)
  useEffect(() => {
    if (mapInstanceRef.current && layersGroupRef.current) {
      layersGroupRef.current.clearLayers();

      markers.forEach(m => {
        L.marker(m.position).addTo(layersGroupRef.current).bindPopup(m.label);
      });

      polylines.forEach(p => {
        L.polyline(p.positions, { color: p.color || '#6366f1', weight: 4, opacity: 0.6 }).addTo(layersGroupRef.current);
      });
    }
  }, [markers, polylines]);

  return (
    <div 
      ref={mapContainerRef} 
      className={className} 
      style={{ height: '100%', width: '100%', borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: '#0f172a' }} 
    />
  );
};
