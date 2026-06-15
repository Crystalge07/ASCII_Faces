import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './index.css';

const rootEl = document.getElementById('root');

if (!rootEl) {
  document.body.textContent = 'Missing #root element in index.html';
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
