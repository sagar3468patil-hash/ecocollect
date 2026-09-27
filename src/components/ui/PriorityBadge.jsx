/**
 * Rule-based priority engine badge.
 * LOW / MEDIUM / HIGH — set by deterministic rules, not ML.
 */
const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    className: 'bg-sage text-forest border border-sage-line',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-amber-bg text-amber border border-amber/30',
  },
  HIGH: {
    label: 'High',
    // Muted brick red — not saturated red
    className: 'bg-clay-bg text-clay border border-clay/30 font-medium',
  },
}

/**
 * @param {'LOW'|'MEDIUM'|'HIGH'} priority
 */
export default function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] ?? {
    label: priority,
    className: 'bg-sage text-ink border border-sage-line',
  }

  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5',
        'text-xs font-sans rounded-sm',
        config.className,
      ].join(' ')}
    >
      {config.label}
    </span>
  )
}
