import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import MapStage from '../components/MapStage.jsx';
import { useMapPoints } from '../hooks/useMapPoints.js';
import {
  getCenteredSquareBounds,
  getPrefetchBounds,
  getTabletBezelBounds,
  getTabletDetails,
  scaleBounds,
} from '../map/mapBounds.js';

export default function App() {
  const { markers, status, lastRequest, handlePrefetch } = useMapPoints();
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

  return (
    <main className="app-shell">
      <Sidebar markers={markers} status={status} lastRequest={lastRequest} />
      <MapStage
        markers={markers}
        prefetchBounds={prefetchBounds}
        tabletBodyBounds={tabletBodyBounds}
        centeredSquareBounds={centeredSquareBounds}
        tabletDetails={tabletDetails}
        tabletBezelBounds={tabletBezelBounds}
        onPrefetchRequired={handlePrefetch}
        onViewportChanged={setViewport}
      />
    </main>
  );
}
