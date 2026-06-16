import { useEffect, useMemo, useState, useCallback } from 'react';
import { loadManifestData } from '../data/manifestData.js';
import { composite } from '../engine/composite.js';
import { LAYER_ORDER, CATEGORY_ORDER } from '../engine/constants.js';
import { decode, encode } from '../engine/serialize.js';
import { randomSelection } from '../engine/randomFace.js';
import { useFaceState } from '../state/useFaceState.js';
import { AsciiTitle } from './AsciiTitle.jsx';
import { Canvas } from './Canvas.jsx';
import { CategoryTabs } from './CategoryTabs.jsx';
import { Gallery } from './Gallery.jsx';

const manifestData = loadManifestData();

function validateSelection(raw, partsById, defaults) {
  const out = { ...defaults };
  for (const cat of CATEGORY_ORDER) {
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
  const { selection, select, replaceSelection, applySelection } = useFaceState(
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

  const showStatus = useCallback((message) => {
    setCopyStatus(message);
    window.setTimeout(() => setCopyStatus(''), 2000);
  }, []);

  const copyToClipboard = useCallback(async () => {
    window.getSelection()?.removeAllRanges();
    try {
      // Prefer rich clipboard (HTML + plain text) to preserve spacing in more apps.
      if (window.ClipboardItem && navigator.clipboard.write) {
        const html = `<pre>${face
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</pre>`;
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([face], { type: 'text/plain' }),
            'text/html': new Blob([html], { type: 'text/html' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(face);
      }
      showStatus('OK: face copied');
    } catch {
      showStatus('ERR: copy failed');
    }
  }, [face, showStatus]);

  const randomizeFace = useCallback(() => {
    applySelection(randomSelection(partsByCategory));
    showStatus('OK: random face generated');
  }, [applySelection, partsByCategory, showStatus]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'c') {
        e.preventDefault();
        copyToClipboard();
      } else if (key === 'r') {
        e.preventDefault();
        randomizeFace();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [copyToClipboard, randomizeFace]);

  return (
    <div className="app">
      <AsciiTitle />

      <main className="app-main">
        <Canvas face={face} />

        <div
          className={
            (partsByCategory[activeCategory]?.length ?? 0) > 5
              ? 'picker-panel picker-panel-grid'
              : 'picker-panel'
          }
        >
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
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                copyToClipboard();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  copyToClipboard();
                }
              }}
            >
              [c] copy
            </span>
            <span
              role="button"
              tabIndex={0}
              className="copy-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                randomizeFace();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  randomizeFace();
                }
              }}
            >
              [r] random
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
