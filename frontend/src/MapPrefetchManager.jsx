import { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';

const DEBOUNCE_MS = 200;
const MOVE_THRESHOLD_RATIO = 0.4;

export default function MapPrefetchManager({ onPrefetchRequired }) {
  const lastFetchedRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const requestPrefetch = (map, immediate = false) => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const last = lastFetchedRef.current;
    const screenHeightInDegrees = 180 / Math.pow(2, zoom - 1);
    const threshold = screenHeightInDegrees * MOVE_THRESHOLD_RATIO;
    const isZoomChanged = !last || zoom !== last.zoom;
    const isMovedEnough =
      !last ||
      Math.abs(center.lat - last.lat) > threshold ||
      Math.abs(center.lng - last.lng) > threshold;

    if (!isZoomChanged && !isMovedEnough) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const run = () => {
      const latestCenter = map.getCenter();
      const latestZoom = map.getZoom();
      lastFetchedRef.current = {
        lat: latestCenter.lat,
        lng: latestCenter.lng,
        zoom: latestZoom,
      };
      onPrefetchRequired({
        centerLat: latestCenter.lat,
        centerLng: latestCenter.lng,
        zoom: latestZoom,
      });
    };

    if (immediate) {
      run();
      return;
    }

    debounceTimerRef.current = setTimeout(run, DEBOUNCE_MS);
  };

  const map = useMapEvents({
    moveend: () => requestPrefetch(map),
    zoomend: () => requestPrefetch(map),
  });

  useEffect(() => {
    requestPrefetch(map, true);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [map]);

  return null;
}
