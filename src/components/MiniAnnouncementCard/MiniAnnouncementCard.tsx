import { Link } from 'react-router-dom'
import Icon from '../Icon/Icon'
import Tags, { TagsVariant } from '../Tags/Tags'
import restaurantImage from '../../assets/card/restaurant.png'
import logoImage from '../../assets/card/logo.png'
import './MiniAnnouncementCard.css'

export interface MiniAnnouncementCardProps {
  /** Foto do restaurante (full-bleed) – default: asset demo. */
  image?: string
  /** Logo do restaurante no overlay – default: asset demo. */
  logo?: string
  /** Nome do restaurante (12px, ellipsis). */
  name: string
  /** Nota exibida ao lado da estrela, ex. "4.9". */
  rating?: string
  /** Distância, ex. "3 km". */
  distance?: string
  /** Offer pill no topo (design 2:8581: oferta-local | cashback | indica) – omitir não renderiza. */
  tag?: TagsVariant
  /** Largura do card em px (design usa 174). */
  width?: number
  /** Rota da página da loja (`/loja/:slug`) – quando presente, o card vira um link. */
  to?: string
}

/**
 * MiniAnnouncementCard – card compacto de anúncio (design node 2:8582).
 * Foto full-bleed com overlay translúcido no rodapé (logo + nome + nota/distância)
 * e o offer pill (`Tags`) no topo. Compõe o rail/carrossel de anúncios.
 */
export default function MiniAnnouncementCard({
  image = restaurantImage,
  logo = logoImage,
  name,
  rating = '4.9',
  distance = '3 km',
  tag,
  width = 174,
  to,
}: MiniAnnouncementCardProps) {
  const content = (
    <>
      <img className="mini-announcement-card__image" src={image} alt={name} />

      {tag && (
        <div className="mini-announcement-card__content">
          <Tags variant={tag} />
        </div>
      )}

      <div className="mini-announcement-card__overlay">
        <img className="mini-announcement-card__logo" src={logo} alt="" />
        <div className="mini-announcement-card__info">
          <p className="mini-announcement-card__name">{name}</p>
          <div className="mini-announcement-card__meta">
            <Icon name="star" size={12} />
            <span className="mini-announcement-card__rating">{rating}</span>
            <span className="mini-announcement-card__dot" aria-hidden="true">
              •
            </span>
            <span className="mini-announcement-card__distance">{distance}</span>
          </div>
        </div>
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="mini-announcement-card mini-announcement-card--link" style={{ width }}>
        {content}
      </Link>
    )
  }
  return (
    <article className="mini-announcement-card" style={{ width }}>
      {content}
    </article>
  )
}
