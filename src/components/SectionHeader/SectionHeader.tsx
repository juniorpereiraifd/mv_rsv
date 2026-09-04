import Skeleton from '../Skeleton/Skeleton'
import './SectionHeader.css'

export interface SectionHeaderProps {
  /**
   * Section title. Omit to render the wireframe's skeleton bar placeholder.
   * Pass a string to swap the skeleton for a real title.
   */
  title?: string
  /**
   * "See all" action label. Omit to render the skeleton bar placeholder.
   * Pass a string to render a real (still un-wired) action.
   */
  actionLabel?: string
  /**
   * Render the green "open now" status dot before the title (Figma design
   * node 2:8573 – "Próximos a você"). Only shows alongside a real title.
   */
  status?: boolean
}

/**
 * SectionHeader – the title row of a content section: a title on the left and
 * an optional "see all" action on the right. In the wireframe both render as
 * gray skeleton bars; pass `title`/`actionLabel` to show real content.
 * Pass `status` to add the green "open now" indicator dot before the title.
 */
export default function SectionHeader({ title, actionLabel, status = false }: SectionHeaderProps) {
  return (
    <div className="section-header">
      {title ? (
        <div className="section-header__content">
          {status && (
            <span className="section-header__status" role="img" aria-label="Aberto agora">
              <span className="section-header__status-ring" />
              <span className="section-header__status-dot" />
            </span>
          )}
          <h2 className="section-header__title">{title}</h2>
        </div>
      ) : (
        <Skeleton height={24} width={151} />
      )}

      {actionLabel ? (
        <button type="button" className="section-header__action">
          {actionLabel}
        </button>
      ) : title ? null : (
        <Skeleton height={24} width={56} />
      )}
    </div>
  )
}
