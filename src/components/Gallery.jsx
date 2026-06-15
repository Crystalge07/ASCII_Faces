import { composite } from '../engine/composite.js';
import { CATEGORY_ORDER } from '../engine/constants.js';

const SECRET_HEAD_ID = 'head_blob_01';
const SECRET_UNLOCK_MSG = 'congrats — you unlocked the secret blob face';

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
  const others = CATEGORY_ORDER.filter((cat) => cat !== activeCategory)
    .map((cat) => partsById[selection[cat]])
    .filter(Boolean);

  const secretHead =
    activeCategory === 'head' ? partsById[SECRET_HEAD_ID] : null;

  return (
    <section className="gallery-section">
      <div className="gallery-wrap">
        <div
          className={variants.length > 5 ? 'gallery gallery-grid' : 'gallery'}
          role="listbox"
          aria-label={`${activeCategory} variants`}
        >
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

        {secretHead && (
          <div className="variant-secret-wrap">
            <button
              type="button"
              className={
                selection.head === SECRET_HEAD_ID
                  ? 'variant variant-secret selected'
                  : 'variant variant-secret'
              }
              aria-label="secret blob head"
              onClick={() => select('head', SECRET_HEAD_ID)}
            >
              <div className="variant-frame">
                <pre className="ascii-face variant-preview">
                  {composite([...others, secretHead])}
                </pre>
              </div>
            </button>
            <p className="secret-unlock-msg">{SECRET_UNLOCK_MSG}</p>
          </div>
        )}
      </div>
    </section>
  );
}
