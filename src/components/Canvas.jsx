/** @param {{ face: string }} props */
export function Canvas({ face }) {
  return (
    <section className="canvas-section" aria-label="Current ASCII face">
      <pre className="terminal-frame-top">{'+--[ output ]' + '-'.repeat(26) + '+'}</pre>
      <div className="canvas-stage">
        <pre className="ascii-face canvas-face">{face}</pre>
      </div>
      <pre className="terminal-frame-bottom">{'+' + '-'.repeat(38) + '+'}</pre>
    </section>
  );
}
