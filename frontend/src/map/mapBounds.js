const PREFETCH_MULTIPLIER = 2.5;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getPrefetchBounds(request) {
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

export function getCenteredSquareBounds(center, bounds) {
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

export function scaleBounds(bounds, latScale, lngScale) {
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

export function getTabletDetails(bodyBounds, screenBounds) {
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

export function getTabletBezelBounds(bodyBounds, screenBounds) {
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
