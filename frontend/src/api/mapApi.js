export async function fetchMapPoints({ centerLat, centerLng, zoom }) {
  const params = new URLSearchParams({
    centerLat: String(centerLat),
    centerLng: String(centerLng),
    zoom: String(zoom),
  });

  const response = await fetch(`/api/map/prefetch?${params}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
