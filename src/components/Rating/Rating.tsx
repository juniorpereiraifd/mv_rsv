import Icon from '../Icon/Icon'
import './Rating.css'

export type RatingVariant = 'review' | 'closed' | 'new'

export interface RatingProps {
  /** `review` (star + score, default) | `closed` (disabled colors) | `new` ("Novo" only). */
  variant?: RatingVariant
  /** Score shown next to the star, e.g. "4.9". */
  value?: string
  /** Review count, e.g. "(12)". */
  count?: string
}

/**
 * Rating – the Card's score row (design node 1:6214). The `new` variant
 * renders only "Novo" (a brand-new store has no score yet); `closed` keeps the
 * same layout with disabled colors.
 */
export default function Rating({ variant = 'review', value = '4.9', count = '(12)' }: RatingProps) {
  if (variant === 'new') {
    return <span className="rating rating--new"><span className="rating__value">Novo</span></span>
  }

  return (
    <span className={`rating rating--${variant}`}>
      <Icon name={variant === 'closed' ? 'star-disabled' : 'star'} size={8} />
      <span className="rating__value">{value}</span>
      <span className="rating__count">{count}</span>
    </span>
  )
}
