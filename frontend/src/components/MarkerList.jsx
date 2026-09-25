import { getTypeStyle } from '../map/pointStyles.js';

export default function MarkerList({ markers }) {
  return (
    <section className="marker-list" aria-label="Загруженные точки">
      <h2>Загруженные точки</h2>
      <ul>
        {markers.map((marker) => {
          const style = getTypeStyle(marker.type);

          return (
            <li key={marker.id}>
              <i
                aria-hidden="true"
                className="type-dot"
                style={{ backgroundColor: style.fillColor }}
              />
              <span>{marker.title}</span>
              <small style={{ color: style.color }}>{style.label}</small>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
