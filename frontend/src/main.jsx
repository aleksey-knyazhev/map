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

function getCenteredSquareBounds(request, bounds) {
  if (!request || !bounds) {
    return null;
  }

  const [[south, west], [north, east]] = bounds;
  const centerLat = (south + north) / 2;
  const centerLng = (west + east) / 2;
  const safeLat = clamp(centerLat, -85, 85);
  const cos = Math.max(Math.cos((safeLat * Math.PI) / 180), 0.01);
  const latSpan = north - south;
  const lngSpan = east - west;
  const squareLatSide = Math.min(latSpan, lngSpan * cos) * 0.32;
  const squareLngSide = squareLatSide / cos;

  return [
    [centerLat - squareLatSide / 2, centerLng - squareLngSide / 2],
    [centerLat + squareLatSide / 2, centerLng + squareLngSide / 2],
  ];
}

function scaleBounds(bounds, latScale, lngScale) {
  if (!bounds) {
    return null;
  }

  const [[south, west], [north, east]] = bounds;
  const centerLat = (south + north) / 2;
  const centerLng = (west + east) / 2;
  const latHalfSide = ((north - south) * latScale) / 2;
  const lngHalfSide = ((east - west) * lngScale) / 2;

  return [
    [centerLat - latHalfSide, centerLng - lngHalfSide],
    [centerLat + latHalfSide, centerLng + lngHalfSide],
  ];
}

function getTabletDetails(bodyBounds, screenBounds) {
  if (!bodyBounds || !screenBounds) {
    return null;
  }

  const [[south, west], [north, east]] = bodyBounds;
  const [[screenSouth], [screenNorth]] = screenBounds;
  const centerLng = (west + east) / 2;
  const latSpan = north - south;

  return {
    camera: [north - latSpan * 0.08, centerLng],
    power: [(south + screenSouth) / 2, centerLng],
  };
}

function getTabletBezelBounds(bodyBounds, screenBounds) {
  if (!bodyBounds || !screenBounds) {
    return [];
  }

  const [[bodySouth, bodyWest], [bodyNorth, bodyEast]] = bodyBounds;
  const [[screenSouth, screenWest], [screenNorth, screenEast]] = screenBounds;

  return [
    [[screenNorth, bodyWest], [bodyNorth, bodyEast]],
    [[bodySouth, bodyWest], [screenSouth, bodyEast]],
    [[screenSouth, bodyWest], [screenNorth, screenWest]],
    [[screenSouth, screenEast], [screenNorth, bodyEast]],
  ];
}

function App() {
  const [markers, setMarkers] = React.useState([]);
  const [status, setStatus] = React.useState('Loading points');
  const [lastRequest, setLastRequest] = React.useState(null);
  const prefetchBounds = React.useMemo(() => getPrefetchBounds(lastRequest), [lastRequest]);
  const centeredSquareBounds = React.useMemo(
    () => getCenteredSquareBounds(lastRequest, prefetchBounds),
    [lastRequest, prefetchBounds],
  );
  const tabletBodyBounds = React.useMemo(
    () => scaleBounds(centeredSquareBounds, 1.09, 1.044),
    [centeredSquareBounds],
  );
  const tabletDetails = React.useMemo(
    () => getTabletDetails(tabletBodyBounds, centeredSquareBounds),
    [tabletBodyBounds, centeredSquareBounds],
  );
  const tabletBezelBounds = React.useMemo(
    () => getTabletBezelBounds(tabletBodyBounds, centeredSquareBounds),
    [tabletBodyBounds, centeredSquareBounds],
  );

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
            <>
              <Rectangle
                bounds={prefetchBounds}
                pathOptions={{
                  color: '#d11f1f',
                  dashArray: '28 24',
                  fill: false,
                  opacity: 0.95,
                  weight: 10,
                }}
              />
              {tabletBodyBounds && centeredSquareBounds && tabletDetails && (
                <>
                  {tabletBezelBounds.map((bounds, index) => (
                    <Rectangle
                      key={`tablet-bezel-${index}`}
                      bounds={bounds}
                      interactive={false}
                      pathOptions={{
                        color: '#ffffff',
                        fillColor: '#ffffff',
                        fillOpacity: 1,
                        opacity: 0,
                        weight: 0,
                      }}
                    />
                  ))}
                  <Rectangle
                    bounds={tabletBodyBounds}
                    interactive={false}
                    pathOptions={{
                      color: '#111827',
                      fill: false,
                      opacity: 0.92,
                      weight: 4,
                    }}
                  />
                  <Rectangle
                    bounds={centeredSquareBounds}
                    interactive={false}
                    pathOptions={{
                      color: '#111827',
                      fill: false,
                      opacity: 0.9,
                      weight: 2,
                    }}
                  />
                  <CircleMarker
                    center={tabletDetails.camera}
                    interactive={false}
                    pathOptions={{
                      color: '#111827',
                      fillColor: '#111827',
                      fillOpacity: 0.9,
                    }}
                    radius={3}
                    weight={1}
                  />
                  <CircleMarker
                    center={tabletDetails.power}
                    interactive={false}
                    pathOptions={{
                      color: '#111827',
                      fill: false,
                      opacity: 0.9,
                    }}
                    radius={8}
                    weight={2}
                  />
                </>
              )}
            </>
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
