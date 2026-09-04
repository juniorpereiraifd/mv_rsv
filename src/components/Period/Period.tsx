import './Period.css'

export type PeriodVariant = 'open' | 'closed' | 'closing-soon'

/** Default labels per variant, as in the design (node 1:6207). */
const PERIOD_LABELS: Record<PeriodVariant, string> = {
  open: 'Aberto até 20h',
  closed: 'Abre às 18h',
  'closing-soon': 'Fecha em 30min',
}

export interface PeriodProps {
  /** `open` (default) | `closed` | `closing-soon`. */
  variant?: PeriodVariant
  /** Override the default label for the chosen variant. */
  label?: string
}

/**
 * Period – the store's opening-hours status line in the Card.
 * Color changes with the variant: primary, secondary, or attention.
 */
export default function Period({ variant = 'open', label }: PeriodProps) {
  return <span className={`period period--${variant}`}>{label ?? PERIOD_LABELS[variant]}</span>
}
