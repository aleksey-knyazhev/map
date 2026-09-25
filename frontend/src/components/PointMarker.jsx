import { Marker, Popup } from 'react-leaflet';
import { getPointIcon } from '../map/pointIcons.js';
import { getTypeStyle } from '../map/pointStyles.js';

export default function PointMarker({ marker }) {
  const style = getTypeStyle(marker.type);

  return (
    <Marker position={[marker.lat, marker.lng]} icon={getPointIcon(marker.type)}>
      <Popup>
        <div className="popup">
          <strong>{marker.title}</strong>
          <span>{style.label}</span>
        </div>
      </Popup>
    </Marker>
  );
}
