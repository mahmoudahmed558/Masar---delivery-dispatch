import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// Fix leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createPilotIcon = (isOnDelivery) => {
  return L.divIcon({
    className: 'pilot-marker',
    html: `<div style="
      background: ${isOnDelivery ? '#6C5CE7' : '#00B894'};
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
};

export default function LiveMap() {
  const [pilots, setPilots] = useState([]);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/pilots/locations');
      const data = response.data?.data || [];
      setPilots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch pilot locations', error);
    }
  };

  return (
    <MapContainer
      center={[30.0444, 31.2357]}
      zoom={12}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {pilots.map((pilot) => (
        pilot.lat && pilot.lng ? (
          <Marker
            key={pilot.pilot_id || pilot.id}
            position={[parseFloat(pilot.lat), parseFloat(pilot.lng)]}
            icon={createPilotIcon(pilot.is_on_delivery || pilot.current_orders_count > 0 || pilot.isOnDelivery)}
          >
            <Popup>
              <strong>{pilot.pilot?.name || pilot.name || `Pilot #${pilot.pilot_id}`}</strong>
              <br />
              <small>Last update: {pilot.created_at ? new Date(pilot.created_at).toLocaleTimeString() : 'N/A'}</small>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}