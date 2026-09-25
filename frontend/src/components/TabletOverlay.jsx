import { CircleMarker, Rectangle } from 'react-leaflet';

export default function TabletOverlay({
  tabletBodyBounds,
  centeredSquareBounds,
  tabletDetails,
  tabletBezelBounds,
}) {
  if (!tabletBodyBounds || !centeredSquareBounds || !tabletDetails) {
    return null;
  }

  return (
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
  );
}
