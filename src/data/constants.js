// ─── Waste categories ────────────────────────────────────────
export const CATEGORIES = [
  'Plastic',
  'Paper',
  'Organic',
  'E-Waste',
  'Glass',
  'Metal',
  'Mixed Waste',
]

// ─── Status flow ─────────────────────────────────────────────
export const STATUSES = ['SUBMITTED', 'REVIEWED', 'SCHEDULED', 'COLLECTED', 'CANCELLED']

// Valid next states from each status (terminal states have empty arrays)
export const STATUS_TRANSITIONS = {
  SUBMITTED:  ['REVIEWED', 'CANCELLED'],
  REVIEWED:   ['SCHEDULED', 'CANCELLED'],
  SCHEDULED:  ['COLLECTED', 'CANCELLED'],
  COLLECTED:  [],
  CANCELLED:  [],
}

// ─── Priority levels ─────────────────────────────────────────
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

// ─── Roles ───────────────────────────────────────────────────
export const ROLES = { CITIZEN: 'citizen', ADMIN: 'admin' }
