import { useEffect, useMemo, useState } from 'react';
import { loadManifestData } from '../data/manifestData.js';
import { composite } from '../engine/composite.js';
import { LAYER_ORDER } from '../engine/constants.js';
import { decode, encode } from '../engine/serialize.js';
import { useFaceState } from '../state/useFaceState.js';
import { AsciiTitle } from './AsciiTitle.jsx';
import { Canvas } from './Canvas.jsx';
import { CategoryTabs } from './CategoryTabs.jsx';
import { Gallery } from './Gallery.jsx';

const manifestData = loadManifestData();

function validateSelection(raw, partsById, defaults) {
  const out = { ...defaults };
  for (const cat of LAYER_ORDER) {
    const id = raw[cat];
    if (id && partsById[id]) {
      out[cat] = id;
    }
  }
  return out;
}

function readSelectionFromHash(partsById, defaults) {
  return validateSelection(decode(window.location.hash), partsById, defaults);
}

function ManifestError({ error }) {
  return (
    <div className="fatal-error">
      <pre className="terminal-rule">{'!'.repeat(42)}</pre>
      <p>{'ERR: could not load parts.json'}</p>
      <p>{error.message}</p>
      <p className="fatal-hint">{'> check src/data/parts.json'}</p>
    </div>
  );
}

function FaceEditor({ partsById, partsByCategory, defaults }) {
  const [activeCategory, setActiveCategory] = useState('head');
  const [copyStatus, setCopyStatus] = useState('');
  const { selection, select, replaceSelection } = useFaceState(
    readSelectionFromHash(partsById, defaults)
  );

  useEffect(() => {
    const syncFromHash = () =>
      replaceSelection(readSelectionFromHash(partsById, defaults));
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, [replaceSelection, partsById, defaults]);

  useEffect(() => {
    const hash = encode(selection);
    const current = window.location.hash.replace(/^#/, '');
    if (current !== hash) {
      const url = `${window.location.pathname}${window.location.search}#${hash}`;
      window.history.replaceState(null, '', url);
    }
  }, [selection]);

  const selectedParts = useMemo(
    () => LAYER_ORDER.map((cat) => partsById[selection[cat]]).filter(Boolean),
    [selection, partsById]
  );

  const face = useMemo(() => composite(selectedParts), [selectedParts]);

  const showStatus = (message) => {
    setCopyStatus(message);
    window.setTimeout(() => setCopyStatus(''), 2000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(face);
      showStatus('OK: face copied to clipboard');
    } catch {
      showStatus('ERR: copy failed');
    }
  };

  return (
    <div className="app">
      <AsciiTitle />

      <main className="app-main">
        <Canvas face={face} />

        <div className="picker-panel">
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <Gallery
            partsByCategory={partsByCategory}
            partsById={partsById}
            selection={selection}
            activeCategory={activeCategory}
            select={select}
          />
        </div>

        <div className="toolbar" role="toolbar" aria-label="Face actions">
          <p className="terminal-label">{'// commands'}</p>
          <div className="toolbar-row">
            <span
              role="button"
              tabIndex={0}
              className="copy-btn"
              onClick={copyToClipboard}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  copyToClipboard();
                }
              }}
            >
              [c] copy
            </span>
          </div>
          {copyStatus && <p className="terminal-status">{copyStatus}</p>}
        </div>
      </main>
    </div>
  );
}

export function App() {
  if (!manifestData.ok) {
    return <ManifestError error={manifestData.error} />;
  }

  const { partsById, partsByCategory, defaults } = manifestData;
  return (
    <FaceEditor
      partsById={partsById}
      partsByCategory={partsByCategory}
      defaults={defaults}
    />
  );
}
