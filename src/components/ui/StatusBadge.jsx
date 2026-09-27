/**
 * Maps internal status values (all-caps data) to
 * sentence-case UI labels and design token color pairs.
 *
 * Status flow: SUBMITTED → REVIEWED → SCHEDULED → COLLECTED
 * Terminal:    CANCELLED
 */
const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    // Waiting / pending — amber tones
    className: 'bg-amber-bg text-amber border border-amber/30',
  },
  REVIEWED: {
    label: 'Reviewed',
    // In progress — sage green tones
    className: 'bg-sage text-forest border border-sage-line',
  },
  SCHEDULED: {
    label: 'Scheduled',
    // Confirmed — slightly stronger sage
    className: 'bg-sage text-forest-dark border border-sage-line font-medium',
  },
  COLLECTED: {
    label: 'Collected',
    // Complete — solid forest (most prominent positive state)
    className: 'bg-forest text-white border border-forest-dark',
  },
  CANCELLED: {
    label: 'Cancelled',
    // Terminal / negative — muted brick red
    className: 'bg-clay-bg text-clay border border-clay/30',
  },
}

/**
 * @param {'SUBMITTED'|'REVIEWED'|'SCHEDULED'|'COLLECTED'|'CANCELLED'} status
 */
export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-sage text-ink border border-sage-line',
  }

  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5',
        'text-xs font-sans rounded-sm', // 6px radius — badge hierarchy
        config.className,
      ].join(' ')}
    >
      {config.label}
    </span>
  )
}
