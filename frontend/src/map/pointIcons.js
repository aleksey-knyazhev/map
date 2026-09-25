import L from 'leaflet';
import { getTypeStyle } from './pointStyles.js';

export function getPointIcon(type) {
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
    iconAnchor: [36, 36],
    iconSize: [72, 72],
    popupAnchor: [0, -36],
  });
}
