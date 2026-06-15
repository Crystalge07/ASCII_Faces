import { useState, useCallback } from 'react';

/** @typedef {Record<string, string>} Selection */

/**
 * @param {Selection} initial
 */
export function useFaceState(initial) {
  const [selection, setSelection] = useState(initial);
  const [past, setPast] = useState(/** @type {Selection[]} */ ([]));
  const [future, setFuture] = useState(/** @type {Selection[]} */ ([]));

  const select = useCallback(
    (category, partId) => {
      setPast((p) => [...p, selection]);
      setFuture([]);
      setSelection((s) => ({ ...s, [category]: partId }));
    },
    [selection]
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      setFuture((f) => [selection, ...f]);
      setSelection(p[p.length - 1]);
      return p.slice(0, -1);
    });
  }, [selection]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      setPast((p) => [...p, selection]);
      setSelection(f[0]);
      return f.slice(1);
    });
  }, [selection]);

  const replaceSelection = useCallback((next) => {
    setSelection(next);
  }, []);

  const applySelection = useCallback((next) => {
    setPast((p) => [...p, selection]);
    setFuture([]);
    setSelection(next);
  }, [selection]);

  return {
    selection,
    select,
    undo,
    redo,
    replaceSelection,
    applySelection,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
