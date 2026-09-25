import React from 'react';
import { fetchMapPoints } from '../api/mapApi.js';

export function useMapPoints() {
  const [markers, setMarkers] = React.useState([]);
  const [status, setStatus] = React.useState('Загрузка точек');
  const [lastRequest, setLastRequest] = React.useState(null);

  const handlePrefetch = React.useCallback(async ({ centerLat, centerLng, zoom }) => {
    const request = { centerLat, centerLng, zoom };

    setLastRequest(request);
    setStatus('Загрузка точек');

    try {
      const data = await fetchMapPoints(request);
      setMarkers(data);
      setStatus(`Загружено точек: ${data.length}`);
    } catch {
      setStatus('Не удалось загрузить точки');
    }
  }, []);

  return {
    markers,
    status,
    lastRequest,
    handlePrefetch,
  };
}
