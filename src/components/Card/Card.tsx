import { Link } from 'react-router-dom'
import Rating, { RatingVariant } from '../Rating/Rating'
import Period, { PeriodVariant } from '../Period/Period'
import Badge, { BadgeVariant } from '../Badge/Badge'
import Tags, { TagsVariant } from '../Tags/Tags'
import restaurantImage from '../../assets/card/restaurant.png'
import logoImage from '../../assets/card/logo.png'
import './Card.css'

export interface CardProps {
  /** Store photo – defaults to the demo asset. */
  image?: string
  /** Store logo shown on the photo – defaults to the demo asset. */
  logo?: string
  /** Store name (14px, ellipsized). */
  title: string
  /** Cuisine / category shown after the rating, e.g. "Café". */
  category?: string
  /** Score shown next to the star, e.g. "4.9". */
  ratingValue?: string
  /** Review count, e.g. "(12)". */
  ratingCount?: string
  /** Rating presentation: review (default) | closed | new. */
  ratingVariant?: RatingVariant
  /** Opening-hours status: open (default) | closed | closing-soon. */
  period?: PeriodVariant
  /** Delivery distance, e.g. "350 m". Omitted hides the distance row segment. */
  distance?: string
  /** Overlay badge on the photo – omitted renders no badge. */
  tag?: BadgeVariant
  /** Offer pill in the info block – omitted renders no pill. */
  tags?: TagsVariant
  /** Rota da página da loja (`/loja/:slug`) – quando presente, o card vira um link. */
  to?: string
}

/**
 * Card – the store card (design node 1:5823). A 174×~310 block: photo
 * (220px, radius 24) with the store logo and an optional badge overlaid, then
 * an info column with title, rating + category, period + distance, and an
 * optional offer pill. All pieces are composable sub-components with the
 * design's variants.
 */
export default function Card({
  image = restaurantImage,
  logo = logoImage,
  title,
  category,
  ratingValue,
  ratingCount,
  ratingVariant,
  period,
  distance,
  tag,
  tags,
  to,
}: CardProps) {
  const content = (
    <>
      <div className="card__media">
        <img className="card__image" src={image} alt={title} />
        {logo && <img className="card__logo" src={logo} alt="" />}
        {tag && <Badge variant={tag} className="card__badge" />}
      </div>

      <div className="card__info">
        <p className="card__title">{title}</p>

        <div className="card__row">
          <Rating variant={ratingVariant} value={ratingValue} count={ratingCount} />
          {category && (
            <>
              <span className="card__dot" aria-hidden="true">
                •
              </span>
              <span className="card__category">{category}</span>
            </>
          )}
        </div>

        <div className="card__row">
          <Period variant={period} />
          {distance && (
            <>
              <span className="card__dot" aria-hidden="true">
                •
              </span>
              <span className="card__distance">{distance}</span>
            </>
          )}
        </div>

        {tags && <Tags variant={tags} />}
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="card card--link">
        {content}
      </Link>
    )
  }
  return <article className="card">{content}</article>
}
