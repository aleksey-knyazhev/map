import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="shell">
      <section className="workspace">
        <div className="panel">
          <p className="eyebrow">React + Vite</p>
          <h1>Map frontend</h1>
          <p className="lead">
            Frontend is ready for Micronaut API calls through the Vite proxy.
          </p>
          <div className="actions">
            <a href="/api" className="primary">
              API
            </a>
            <a href="http://localhost:8080" className="secondary">
              Backend
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
