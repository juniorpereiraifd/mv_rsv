import Icon from '../../../components/Icon/Icon'
import type { Merchant } from '../../../data/merchants'
import './RestaurantHeader.css'

interface RestaurantHeaderProps {
  merchant: Merchant
}

/** Tons do status (design 68:3769): aberto em verde sucesso, fecha/abre em âmbar. */
type StatusTone = 'success' | 'attention'

/** Texto do status a partir do `period` da loja (mesmo vocabulário do Period). */
function statusFor(merchant: Merchant): { text: string; tone: StatusTone } {
  if (merchant.period === 'closing-soon') {
    return { text: 'Fecha em 30min', tone: 'attention' }
  }
  if (merchant.period === 'closed') {
    const opening = merchant.hours.split(' - ')[0] ?? '18:00'
    return { text: `Abre às ${opening}`, tone: 'attention' }
  }
  return { text: 'Aberto agora', tone: 'success' }
}

/** Faixa de preço – o nível atual no tom da meta (#666), os demais esmaecidos
 * (design 68:3768: `$$` em #e0e0e0 quando a loja é `$$`/`$$$`). */
const PRICE_TIERS = ['$', '$$', '$$$'] as const

function PriceTier({ tier }: { tier: Merchant['priceTier'] }) {
  const activeIdx = PRICE_TIERS.indexOf(tier)
  return (
    <span className="restaurant-header__price" aria-label={`Faixa de preço ${tier}`}>
      {PRICE_TIERS.map((level, i) => (
        <span
          key={level}
          className={`restaurant-header__price-tier${i > activeIdx ? ' restaurant-header__price-tier--off' : ''}`}
        >
          {level}
        </span>
      ))}
    </span>
  )
}

/**
 * RestaurantHeader – bloco do topo do corpo branco (design 68:3755):
 * nome 20px Medium, meta "5 m • Italiana • $$", status com ponto de cor + horas
 * e relógio; coluna direita com estrela + nota + "(+999)"; botão "Como chegar"
 * (40px, rounded-16) que rola até a seção de Localização.
 */
export default function RestaurantHeader({ merchant }: RestaurantHeaderProps) {
  const status = statusFor(merchant)

  const goToLocation = () => {
    document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="restaurant-header">
      <div className="restaurant-header__row">
        <div className="restaurant-header__content">
          <h1 className="restaurant-header__name">{merchant.name}</h1>

          <div className="restaurant-header__meta">
            <span>{merchant.distance}</span>
            <span className="restaurant-header__dot" aria-hidden="true">
              •
            </span>
            <span>{merchant.category}</span>
            <span className="restaurant-header__dot" aria-hidden="true">
              •
            </span>
            <PriceTier tier={merchant.priceTier} />
          </div>

          <div className="restaurant-header__status">
            <span
              className={`restaurant-header__status-dot restaurant-header__status-dot--${status.tone}`}
              aria-hidden="true"
            />
            <span className={`restaurant-header__status-text restaurant-header__status-text--${status.tone}`}>
              {status.text}
            </span>
            <span className="restaurant-header__dot" aria-hidden="true">
              •
            </span>
            <span className="restaurant-header__hours">{merchant.hours}</span>
            <span className="restaurant-header__clock">
              <Icon name="clock" size={16} />
            </span>
          </div>
        </div>

        <div className="restaurant-header__rating">
          <div className="restaurant-header__score">
            <Icon name="star" size={12} />
            <span className="restaurant-header__score-value">{merchant.ratingValue ?? '—'}</span>
          </div>
          <span className="restaurant-header__count">({merchant.reviewTotal})</span>
        </div>
      </div>

      <div className="restaurant-header__actions">
        <button type="button" className="restaurant-header__route" onClick={goToLocation}>
          Como chegar
          <Icon name="route" style="Line" size={20} />
        </button>
      </div>
    </header>
  )
}
