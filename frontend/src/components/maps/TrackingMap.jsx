import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pilotIcon = L.divIcon({
  className: 'pilot-marker',
  html: `<div style="
    background: #6C5CE7;
    color: white;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">🛵</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function TrackingMap({ pilotLat, pilotLng, pilotName = 'Pilot' }) {
  if (!pilotLat || !pilotLng) {
    return <div className="map-placeholder">📍 Map not available</div>;
  }

  return (
    <MapContainer
      center={[pilotLat, pilotLng]}
      zoom={15}
      style={{ height: '300px', width: '100%', borderRadius: '12px' }}
    >
      <RecenterMap lat={pilotLat} lng={pilotLng} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[pilotLat, pilotLng]} icon={pilotIcon}>
        <Popup>
          <strong>🛵 {pilotName}</strong>
          <br />
          <small>Live location</small>
        </Popup>
      </Marker>
    </MapContainer>
  );
}