// CardComponents.jsx
import { TYPE_STYLES, RARITY_BADGE } from "./TypeStyles.jsx"

// --- CardBadge ---
export function CardBadge({ children, className = "", style = {} }) {
  return <span className={`card-badge ${className}`} style={style}>{children}</span>
}

// --- CardItem ---
export function CardItem({ c }) {
  const t = TYPE_STYLES[c.kind] || TYPE_STYLES.default
  const rb = RARITY_BADGE[c.rarity] || RARITY_BADGE.common

  return (
    <div
      className="card-item"
      style={{
  background: `
    linear-gradient(135deg, ${t.bg1}, ${t.bg2}),
    rgba(255, 255, 255, 0.2) /* light overlay for brightness */
  `,
  backgroundBlendMode: 'overlay',
  border: `1px solid ${t.ring}22`,
  boxShadow: `0 6px 24px ${t.ring}3a`,
}}
    >
      <div className="card-surface">
      {/* Top */}
      <div className="card-top">
        <div className="card-icon">{c.icon || t.icon}</div>
        <div className="card-badges">
          {c.rarity && (
            <CardBadge style={{ background: rb.bg, color: rb.color }}>
              {c.rarity}
            </CardBadge>
          )}
          {c.level && (
            <CardBadge className="level-badge">Lv {c.level}</CardBadge>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="card-title">{c.title}</div>

      {/* Subtitle */}
      {!!c.subtitle && <div className="card-subtitle">{c.subtitle}</div>}

      {/* Footer */}
      <div className="card-footer">
        <span>{c.kind}</span>
        {c.createdAt && <span>{new Date(c.createdAt).toLocaleDateString()}</span>}
      </div>
      </div>
    </div>
  )
}

// --- CardsFilters ---
const KINDS = ["expense", "income", "saving", "split", "upi", "roundup", "achievement"]
const RARITIES = ["common", "rare", "epic", "legendary"]

export function CardsFilters({ value, onChange, onReset }) {
  return (
    <div className="filters">
      <select
        value={value.kind}
        onChange={(e) => onChange({ ...value, kind: e.target.value, page: 1 })}
        className="fp-select"
      >
        <option value="">All types</option>
        {KINDS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <select
        value={value.rarity}
        onChange={(e) => onChange({ ...value, rarity: e.target.value, page: 1 })}
        className="fp-select"
      >
        <option value="">All rarity</option>
        {RARITIES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        value={value.sort}
        onChange={(e) => onChange({ ...value, sort: e.target.value })}
        className="fp-select"
      >
        <option value="-createdAt">Newest</option>
        <option value="createdAt">Oldest</option>
      </select>

      <button className="fp-btn" onClick={onReset}>
        Reset
      </button>
    </div>
  )
}

// --- CardSkeleton ---
export function CardSkeleton() {
  return <div className="card-skeleton" />
}
