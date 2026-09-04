import Icon from '../../../components/Icon/Icon'
import MomentsCarousel from '../../../components/MomentsCarousel/MomentsCarousel'
import type { Merchant } from '../../../data/merchants'
import './ReviewsSection.css'

interface ReviewsSectionProps {
  merchant: Merchant
}

/** Nº de fotos que o bento "Fotos" (GallerySection) exibe logo acima. */
const GALLERY_TILES_ON_PAGE = 4

/**
 * Fotos dos cards de momento: as fotos REAIS de salão/prato da loja
 * (`merchant.gallery`), simulando a foto que o cliente postou na avaliação.
 *
 * Exclui a capa/hero (`merchant.image`) – em várias lojas a capa também fecha a
 * galeria, e repeti-la num card pareceria bug. Como o bento "Fotos" já usa as 4
 * primeiras na tela acima, empurra essas para o fim do pool e começa pelas
 * restantes: com galeria grande os cards visíveis mostram fotos inéditas; com
 * galeria curta, recicla (protótipo – reuso da galeria é esperado).
 */
function momentPhotos(merchant: Merchant): string[] {
  const salon = merchant.gallery.filter((url) => url !== merchant.image)
  if (salon.length <= GALLERY_TILES_ON_PAGE) return salon
  return [...salon.slice(GALLERY_TILES_ON_PAGE), ...salon.slice(0, GALLERY_TILES_ON_PAGE)]
}

/** Linha do gráfico de notas – rótulo à esquerda, estrela + valor à direita. */
function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="reviews-section__bar">
      <span className="reviews-section__bar-label">{label}</span>
      <span className="reviews-section__bar-score">
        <Icon name="star" size={12} />
        <span>{value > 0 ? value.toFixed(1) : '—'}</span>
      </span>
    </div>
  )
}

/**
 * ReviewsSection – bloco "Avaliações" (design 68:3865): card da nota (valor
 * 40px, total de avaliações e gráfico Comida/Serviço/Ambiente), o resumo
 * "O que os clientes dizem?" (com selo "Resumido por IA") e, por último, o
 * rail de "Momentos compartilhados" (design 68:3911) – dentro da seção, sem
 * título nem "Ver todos".
 *
 * Desvio: lojas novas (sem nota) exibem "—" e barras sem valor.
 */
export default function ReviewsSection({ merchant }: ReviewsSectionProps) {
  return (
    <section id="avaliacoes" className="reviews-section">
      <div className="reviews-section__header">
        <h2 className="reviews-section__title">Avaliações</h2>
        <a
          className="reviews-section__see-all"
          href="#avaliacoes"
          onClick={(e) => e.preventDefault()}
        >
          Ver todas
        </a>
      </div>

      <div className="reviews-section__rating">
        <div className="reviews-section__rating-card">
          <div className="reviews-section__graph">
            <div className="reviews-section__score">
              <div className="reviews-section__score-value">
                <Icon name="star" size={24} />
                <span className="reviews-section__score-number">
                  {merchant.ratingValue ?? '—'}
                </span>
              </div>
              <span className="reviews-section__score-count">
                {merchant.reviewTotal} avaliações
              </span>
            </div>

            <div className="reviews-section__graph-divider" aria-hidden="true" />

            <div className="reviews-section__bars">
              <ScoreBar label="Comida" value={merchant.reviewScores.food} />
              <ScoreBar label="Serviço" value={merchant.reviewScores.service} />
              <ScoreBar label="Ambiente" value={merchant.reviewScores.atmosphere} />
            </div>
          </div>

          <div className="reviews-section__summary">
            <div className="reviews-section__summary-header">
              <span className="reviews-section__summary-title">O que os clientes dizem?</span>
              <span className="reviews-section__summary-ai">Resumido por IA</span>
            </div>
            <p className="reviews-section__summary-text">{merchant.reviewSummary}</p>
          </div>
        </div>
      </div>

      <MomentsCarousel moments={merchant.sharedMoments} photos={momentPhotos(merchant)} />
    </section>
  )
}
