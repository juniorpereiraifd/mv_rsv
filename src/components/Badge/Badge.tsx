import Icon from '../Icon/Icon'
import './Badge.css'

export type BadgeVariant = 'popular' | 'premium' | 'exclusivo' | 'gourmet'

export interface BadgeProps {
  /** `popular` (default) | `premium` | `exclusivo` | `gourmet`. */
  variant?: BadgeVariant
  /** Extra class names – the Card positions the badge absolutely on the image. */
  className?: string
}

/**
 * Badge – the overlay pill on the Card image (design node 1:6191).
 * A translucent blurred capsule that tints the label by variant:
 * popular/gourmet in white, exclusivo/premium in the warm cream (`--color-text-on-clube`).
 * Popular leads a fire icon, exclusivo a ribbon icon; premium is flanked by
 * mirrored crowns and gourmet carries a white seal.
 */
export default function Badge({ variant = 'popular', className }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}${className ? ` ${className}` : ''}`}>
      {variant === 'popular' && (
        <>
          <Icon name="fire" size={12} />
          <span className="badge__label">Popular</span>
        </>
      )}
      {variant === 'exclusivo' && (
        <>
          <Icon name="exclusive" size={12} />
          <span className="badge__label">Exclusivo</span>
        </>
      )}
      {variant === 'premium' && (
        <>
          <Icon name="top50-left" width={7} height={13} className="badge__crown" />
          <span className="badge__label">Premium</span>
          <Icon name="top50-right" width={7} height={13} className="badge__crown badge__crown--right" />
        </>
      )}
      {variant === 'gourmet' && (
        <>
          <span className="badge__seal">
            <Icon name="gourmet" size={13} />
          </span>
          <span className="badge__label">Gourmet</span>
        </>
      )}
    </span>
  )
}
