export default function StatusPanel({ status, lastRequest }) {
  return (
    <section className="status-panel" aria-label="Статус pre-fetch">
      <div>
        <span>Статус</span>
        <strong>{status}</strong>
      </div>
      {lastRequest && (
        <dl>
          <div>
            <dt>Широта</dt>
            <dd>{lastRequest.centerLat.toFixed(4)}</dd>
          </div>
          <div>
            <dt>Долгота</dt>
            <dd>{lastRequest.centerLng.toFixed(4)}</dd>
          </div>
          <div>
            <dt>Масштаб</dt>
            <dd>{lastRequest.zoom}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
