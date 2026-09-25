import React from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Popup, Rectangle, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import MapPrefetchManager from './MapPrefetchManager.jsx';

const PREFETCH_MULTIPLIER = 2.5;
const TYPE_STYLES = {
  culture: {
    label: 'Культура',
    color: '#7c3aed',
    fillColor: '#c4b5fd',
    icon: 'M6 8h20v4H6z M8 13h3v9H8z M15 13h3v9h-3z M22 13h3v9h-3z M5 23h22v3H5z M16 4l11 3H5z',
  },
  landmark: {
    label: 'Ориентир',
    color: '#b91c1c',
    fillColor: '#fca5a5',
    icon: 'M16 3l10 8h-3v15h-5v-8h-4v8H9V11H6z',
  },
  park: {
    label: 'Парк',
    color: '#15803d',
    fillColor: '#86efac',
    icon: 'M16 4c4 0 7 3 7 7 0 3-2 6-5 7v8h-4v-8c-3-1-5-4-5-7 0-4 3-7 7-7z',
  },
  sport: {
    label: 'Спорт',
    color: '#1d4ed8',
    fillColor: '#93c5fd',
    icon: 'M16 4a12 12 0 100 24 12 12 0 000-24z M8 16h16 M16 4c3 3 4 7 4 12s-1 9-4 12 M16 4c-3 3-4 7-4 12s1 9 4 12',
  },
  street: {
    label: 'Улица',
    color: '#ca8a04',
    fillColor: '#fde68a',
    icon: 'M15 4h2l5 24h-4l-1-7h-2l-1 7h-4z M12 4h-2L5 28h4l1-7h2l1 7h4z M14 8h4 M13 14h6 M12 20h8',
  },
  transport: {
    label: 'Транспорт',
    color: '#0f766e',
    fillColor: '#5eead4',
    icon: 'M8 7c0-2 2-4 4-4h8c2 0 4 2 4 4v14c0 2-2 4-4 4l2 3h-4l-1-2h-2l-1 2h-4l2-3c-2 0-4-2-4-4z M11 8h10v6H11z M11 20h3 M18 20h3',
  },
  venue: {
    label: 'Площадка',
    color: '#c2410c',
    fillColor: '#fdba74',
    icon: 'M7 10h18v14H7z M10 7h12v3H10z M11 14h4v4h-4z M17 14h4v4h-4z M11 20h10',
  },
};
const DEFAULT_TYPE_STYLE = {
  label: 'Точка',
  color: '#1f6f56',
  fillColor: '#f0b13e',
  icon: 'M16 4a10 10 0 00-10 10c0 7 10 14 10 14s10-7 10-14A10 10 0 0016 4z M16 10a4 4 0 110 8 4 4 0 010-8z',
};

function getTypeStyle(type) {
  return TYPE_STYLES[type] ?? DEFAULT_TYPE_STYLE;
}

function getPointIcon(type) {
  const style = getTypeStyle(type);

  return L.divIcon({
    className: 'map-point-icon',
    html: `
      <span class="map-point-icon__shape" style="--point-color: ${style.color}; --point-fill: ${style.fillColor};">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="${style.icon}"></path>
        </svg>
      </span>
    `,
    iconAnchor: [18, 18],
    iconSize: [36, 36],
    popupAnchor: [0, -18],
  });
}

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

function getCenteredSquareBounds(center, bounds) {
  if (!center || !bounds) {
    return null;
  }

  const [[south, west], [north, east]] = bounds;
  const safeLat = clamp(center.centerLat, -85, 85);
  const cos = Math.max(Math.cos((safeLat * Math.PI) / 180), 0.01);
  const latSpan = north - south;
  const lngSpan = east - west;
  const squareLatSide = Math.min(latSpan, lngSpan * cos) * 0.32;
  const squareLngSide = squareLatSide / cos;

  return [
    [center.centerLat - squareLatSide / 2, center.centerLng - squareLngSide / 2],
    [center.centerLat + squareLatSide / 2, center.centerLng + squareLngSide / 2],
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
  const [status, setStatus] = React.useState('Загрузка точек');
  const [lastRequest, setLastRequest] = React.useState(null);
  const [viewport, setViewport] = React.useState(null);
  const prefetchBounds = React.useMemo(() => getPrefetchBounds(lastRequest), [lastRequest]);
  const centeredSquareBounds = React.useMemo(
    () => getCenteredSquareBounds(viewport ?? lastRequest, prefetchBounds),
    [viewport, lastRequest, prefetchBounds],
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
    setStatus('Загрузка точек');

    fetch(`/api/map/prefetch?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMarkers(data);
        setStatus(`Загружено точек: ${data.length}`);
      })
      .catch(() => {
        setStatus('Не удалось загрузить точки');
      });
  }, []);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Micronaut + React</p>
          <h1>Наземная станция мониторинга</h1>
          <p className="lead">
            Перемещайте карту или меняйте масштаб. Клиент запрашивает расширенную
            область pre-fetch и отображает точки, полученные из backend.
          </p>
        </div>

        <section className="status-panel" aria-label="Статус pre-fetch">
          <div>
            <span>Статус</span>
            <strong>{status}</strong>
          </div>
          {lastRequest && (
            <dl>
              <div>
                <dt>Широта</dt>
                <dd>{lastRequest.centerLat.toFixed(4)}</dd>
              </div>
              <div>
                <dt>Долгота</dt>
                <dd>{lastRequest.centerLng.toFixed(4)}</dd>
              </div>
              <div>
                <dt>Масштаб</dt>
                <dd>{lastRequest.zoom}</dd>
              </div>
            </dl>
          )}
        </section>

        <section className="marker-list" aria-label="Загруженные точки">
          <h2>Загруженные точки</h2>
          <ul>
            {markers.map((marker) => (
              <li key={marker.id}>
                <i
                  aria-hidden="true"
                  className="type-dot"
                  style={{ backgroundColor: getTypeStyle(marker.type).fillColor }}
                />
                <span>{marker.title}</span>
                <small style={{ color: getTypeStyle(marker.type).color }}>
                  {getTypeStyle(marker.type).label}
                </small>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <section className="map-stage" aria-label="Интерактивная карта">
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
          <MapPrefetchManager
            onPrefetchRequired={handlePrefetch}
            onViewportChanged={setViewport}
          />
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
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={getPointIcon(marker.type)}
            >
              <Popup>
                <div className="popup">
                  <strong>{marker.title}</strong>
                  <span>{getTypeStyle(marker.type).label}</span>
                </div>
              </Popup>
            </Marker>
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
