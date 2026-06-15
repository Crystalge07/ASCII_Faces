import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { setFavicon } from './favicon.js';
import './index.css';

try {
  setFavicon();
} catch {
  // Favicon is optional — don't block the app if canvas or parts fail.
}

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
