import { composite } from '../engine/composite.js';
import { LAYER_ORDER } from '../engine/constants.js';

/**
 * @param {{
 *   partsByCategory: Record<string, import('../engine/normalize.js').NormalizedPart[]>,
 *   partsById: Record<string, import('../engine/normalize.js').NormalizedPart>,
 *   selection: Record<string, string>,
 *   activeCategory: string,
 *   select: (category: string, partId: string) => void,
 * }} props
 */
export function Gallery({
  partsByCategory,
  partsById,
  selection,
  activeCategory,
  select,
}) {
  const variants = partsByCategory[activeCategory] ?? [];
  const others = LAYER_ORDER.filter((cat) => cat !== activeCategory)
    .map((cat) => partsById[selection[cat]])
    .filter(Boolean);

  return (
    <section className="gallery-section">
      <div className="gallery" role="listbox" aria-label={`${activeCategory} variants`}>
        {variants.map((variant) => {
          const preview = composite([...others, variant]);
          const isSelected = selection[activeCategory] === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={variant.id}
              className={isSelected ? 'variant selected' : 'variant'}
              onClick={() => select(activeCategory, variant.id)}
            >
              <div className="variant-frame">
                <pre className="ascii-face variant-preview">{preview}</pre>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
