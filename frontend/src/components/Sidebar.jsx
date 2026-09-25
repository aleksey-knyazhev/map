import MarkerList from './MarkerList.jsx';
import StatusPanel from './StatusPanel.jsx';

export default function Sidebar({ markers, status, lastRequest }) {
  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Micronaut + React</p>
        <h1>Наземная станция мониторинга</h1>
        <p className="lead">
          Перемещайте карту или меняйте масштаб. Клиент запрашивает расширенную
          область pre-fetch и отображает точки, полученные из backend.
        </p>
      </div>

      <StatusPanel status={status} lastRequest={lastRequest} />
      <MarkerList markers={markers} />
    </aside>
  );
}
