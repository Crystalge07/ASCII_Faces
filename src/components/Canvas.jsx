import { composite } from '../engine/composite.js';

/** @param {{ face: string }} props */
export function Canvas({ face }) {
  return (
    <section className="canvas-section">
      <h2 className="section-label">Your face</h2>
      <pre className="ascii-face canvas-face" aria-label="Current ASCII face">
        {face}
      </pre>
    </section>
  );
}
