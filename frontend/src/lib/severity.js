// Central place to classify an alert_type string into a severity band.
// Keeps color logic out of the components, and gives one spot to extend
// when the backend introduces new alert_type values.

// Matched against alert_type.toLowerCase() as a substring check, so both
// snake_case ("boundary_crossed") and the actual Title Case strings your
// backend sends today ("Boundary Crossed", from behaviour.py) both hit.
const CRITICAL = [
  'boundary crossed', 'boundary_crossed', 'crossed',
  'intrusion', 'breach', 'zone_violation', 'weapon_detected', 'fence_breach',
]
const WARNING = [
  'loitering detected', 'loitering',
  'unauthorized_object', 'signal_loss', 'low_confidence_track',
]

export function severityOf(alertType = '') {
  const key = alertType.toLowerCase()
  if (CRITICAL.some((k) => key.includes(k))) return 'critical'
  if (WARNING.some((k) => key.includes(k))) return 'warning'
  return 'nominal'
}

export const SEVERITY_STYLES = {
  critical: {
    text: 'text-signal-red',
    dot: 'bg-signal-red',
    border: 'border-signal-red/40',
    bg: 'bg-signal-red/10',
    ring: 'ring-signal-red/30',
  },
  warning: {
    text: 'text-signal-amber',
    dot: 'bg-signal-amber',
    border: 'border-signal-amber/40',
    bg: 'bg-signal-amber/10',
    ring: 'ring-signal-amber/30',
  },
  nominal: {
    text: 'text-signal-green',
    dot: 'bg-signal-green',
    border: 'border-signal-green/40',
    bg: 'bg-signal-green/10',
    ring: 'ring-signal-green/30',
  },
}

export function formatTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleTimeString('en-IN', { hour12: false })
}

export function formatDateTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', { hour12: false })
}
