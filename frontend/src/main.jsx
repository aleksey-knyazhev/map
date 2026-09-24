import React from 'react';
import { createRoot } from 'react-dom/client';
import { CircleMarker, MapContainer, Popup, Rectangle, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import MapPrefetchManager from './MapPrefetchManager.jsx';

const PREFETCH_MULTIPLIER = 2.5;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getPrefetchBounds(request) {
  if (!request) {
    return null;
  }

  const safeLat = clamp(request.centerLat, -85, 85);
  const safeZoom = clamp(request.zoom, 1, 19);
  const screenVerticalSpan = 180 / Math.pow(2, safeZoom - 1);
  const latHalfDelta = (screenVerticalSpan / 2) * PREFETCH_MULTIPLIER;
  const cos = Math.max(Math.cos((safeLat * Math.PI) / 180), 0.01);
  const lngHalfDelta = Math.min(latHalfDelta / cos, 180);

  return [
    [clamp(safeLat - latHalfDelta, -90, 90), request.centerLng - lngHalfDelta],
    [clamp(safeLat + latHalfDelta, -90, 90), request.centerLng + lngHalfDelta],
  ];
}

function App() {
  const [markers, setMarkers] = React.useState([]);
  const [status, setStatus] = React.useState('Loading points');
  const [lastRequest, setLastRequest] = React.useState(null);
  const prefetchBounds = React.useMemo(() => getPrefetchBounds(lastRequest), [lastRequest]);

  const handlePrefetch = React.useCallback(({ centerLat, centerLng, zoom }) => {
    const params = new URLSearchParams({
      centerLat: String(centerLat),
      centerLng: String(centerLng),
      zoom: String(zoom),
    });

    setLastRequest({ centerLat, centerLng, zoom });
    setStatus('Loading points');

    fetch(`/api/map/prefetch?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMarkers(data);
        setStatus(`${data.length} points loaded`);
      })
      .catch(() => {
        setStatus('Failed to load points');
      });
  }, []);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Micronaut + React</p>
          <h1>Map prefetch</h1>
          <p className="lead">
            Move or zoom the map. The client requests a larger buffered area and
            renders hardcoded points returned by the backend.
          </p>
        </div>

        <section className="status-panel" aria-label="Prefetch status">
          <div>
            <span>Status</span>
            <strong>{status}</strong>
          </div>
          {lastRequest && (
            <dl>
              <div>
                <dt>Lat</dt>
                <dd>{lastRequest.centerLat.toFixed(4)}</dd>
              </div>
              <div>
                <dt>Lng</dt>
                <dd>{lastRequest.centerLng.toFixed(4)}</dd>
              </div>
              <div>
                <dt>Zoom</dt>
                <dd>{lastRequest.zoom}</dd>
              </div>
            </dl>
          )}
        </section>

        <section className="marker-list" aria-label="Loaded points">
          <h2>Loaded points</h2>
          <ul>
            {markers.map((marker) => (
              <li key={marker.id}>
                <span>{marker.title}</span>
                <small>{marker.type}</small>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <section className="map-stage" aria-label="Interactive map">
        <MapContainer
          center={[59.9386, 30.3141]}
          zoom={11}
          minZoom={8}
          maxZoom={18}
          className="map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapPrefetchManager onPrefetchRequired={handlePrefetch} />
          {prefetchBounds && (
            <Rectangle
              bounds={prefetchBounds}
              pathOptions={{
                color: '#d11f1f',
                dashArray: '8 8',
                fill: false,
                opacity: 0.95,
                weight: 2,
              }}
            />
          )}
          {markers.map((marker) => (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lng]}
              pathOptions={{ color: '#1f6f56', fillColor: '#f0b13e', fillOpacity: 0.9 }}
              radius={8}
              weight={2}
            >
              <Popup>
                <div className="popup">
                  <strong>{marker.title}</strong>
                  <span>{marker.type}</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
