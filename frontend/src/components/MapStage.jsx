import { MapContainer, Rectangle, TileLayer } from 'react-leaflet';
import MapPrefetchManager from '../MapPrefetchManager.jsx';
import PointMarker from './PointMarker.jsx';
import TabletOverlay from './TabletOverlay.jsx';

export default function MapStage({
  markers,
  prefetchBounds,
  tabletBodyBounds,
  centeredSquareBounds,
  tabletDetails,
  tabletBezelBounds,
  onPrefetchRequired,
  onViewportChanged,
}) {
  return (
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
          onPrefetchRequired={onPrefetchRequired}
          onViewportChanged={onViewportChanged}
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
            <TabletOverlay
              tabletBodyBounds={tabletBodyBounds}
              centeredSquareBounds={centeredSquareBounds}
              tabletDetails={tabletDetails}
              tabletBezelBounds={tabletBezelBounds}
            />
          </>
        )}
        {markers.map((marker) => (
          <PointMarker key={marker.id} marker={marker} />
        ))}
      </MapContainer>
    </section>
  );
}
