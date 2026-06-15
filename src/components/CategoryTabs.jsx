import { LAYER_ORDER } from '../engine/constants.js';

/**
 * @param {{
 *   activeCategory: string,
 *   onCategoryChange: (category: string) => void,
 * }} props
 */
export function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className="category-bar">
      <p className="terminal-label">{'// layer'}</p>
      <nav className="category-tabs" aria-label="Face part categories">
        {LAYER_ORDER.map((category) => (
          <button
            key={category}
            type="button"
            className={category === activeCategory ? 'tab active' : 'tab'}
            aria-current={category === activeCategory ? 'page' : undefined}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </nav>
    </div>
  );
}
