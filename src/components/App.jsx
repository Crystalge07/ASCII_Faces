import { useEffect, useMemo, useState } from 'react';
import { loadManifestData } from '../data/manifestData.js';
import { composite } from '../engine/composite.js';
import { LAYER_ORDER } from '../engine/constants.js';
import { decode, encode } from '../engine/serialize.js';
import { useFaceState } from '../state/useFaceState.js';
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
      <h1>Could not load face parts</h1>
      <p>{error.message}</p>
      <p className="fatal-hint">
        Check <code>src/data/parts.json</code> for invalid or overflowing parts.
      </p>
    </div>
  );
}

function FaceEditor({ partsById, partsByCategory, defaults }) {
  const [activeCategory, setActiveCategory] = useState('head');
  const [copyStatus, setCopyStatus] = useState('');
  const { selection, select, undo, redo, replaceSelection, canUndo, canRedo } =
    useFaceState(readSelectionFromHash(partsById, defaults));

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
      showStatus('Face copied!');
    } catch {
      showStatus('Copy failed');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showStatus('Link copied!');
    } catch {
      showStatus('Copy failed');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ASCII Facemaker</h1>
        <p className="tagline">Build a face by picking parts from the gallery.</p>
      </header>

      <main className="app-main">
        <div className="editor-panel">
          <Canvas face={face} />

          <div className="toolbar">
            <button type="button" onClick={undo} disabled={!canUndo}>
              Undo
            </button>
            <button type="button" onClick={redo} disabled={!canRedo}>
              Redo
            </button>
            <button type="button" onClick={copyToClipboard}>
              Copy face
            </button>
            <button type="button" onClick={copyLink}>
              Copy link
            </button>
            {copyStatus && <span className="copy-status">{copyStatus}</span>}
          </div>

          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <Gallery
          partsByCategory={partsByCategory}
          partsById={partsById}
          selection={selection}
          activeCategory={activeCategory}
          select={select}
        />
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
