import type { SharedMoment } from '../../data/merchants'
import ReviewCard from '../../pages/RestaurantPage/ReviewCard/ReviewCard'
import './MomentsCarousel.css'

interface MomentsCarouselProps {
  /** Momentos compartilhados da loja – cards do rail (design 68:3911). */
  moments: SharedMoment[]
  /** Fotos de salão/prato da loja que simulam as fotos do cliente: uma
   * DIFERENTE por card, ciclando se houver menos fotos que cards. Sem pool, os
   * cards usam o asset demo padrão. */
  photos?: string[]
}

/**
 * MomentsCarousel – rail horizontal de "Momentos compartilhados"
 * (design 68:3911): apenas o rail de ReviewCard, sem título nem link "Ver
 * todos". Rola com snap horizontal quando os cards excedem o container.
 *
 * O rail vive DENTRO da seção "Avaliações" (`#avaliacoes`), como último filho.
 */
export default function MomentsCarousel({ moments, photos = [] }: MomentsCarouselProps) {
  return (
    <div className="moments-carousel__rail">
      {moments.map((moment, index) => (
        <ReviewCard
          key={moment.author}
          moment={moment}
          image={photos.length ? photos[index % photos.length] : undefined}
        />
      ))}
    </div>
  )
}
