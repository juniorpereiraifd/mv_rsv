import Icon from '../../../components/Icon/Icon'
import type { Merchant } from '../../../data/merchants'
import './AboutSection.css'

interface AboutSectionProps {
  merchant: Merchant
}

/**
 * Mapa de SP estilizado (placeholder, sem asset externo): SVG inline em tons
 * neutros desenhando ruas/quadras claras de um mapa urbano, que preenche o tile
 * atrás do pin central. `preserveAspectRatio="slice"` cobre o tile em qualquer
 * proporção; os traçados estouram o viewBox para não vazar borda ao cortar.
 */
function MapPlaceholder() {
  return (
    <svg
      className="about-section__map-art"
      viewBox="0 0 400 320"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Fundo do mapa */}
      <rect width="400" height="320" fill="#eae3d3" />
      {/* Parques / áreas verdes – manchas orgânicas */}
      <g fill="#d4e1c4">
        <path d="M10 18 L54 12 L64 40 L52 62 L18 58 L4 40 Z" />
        <path d="M66 150 L124 142 L146 186 L134 236 L82 244 L58 196 Z" />
        <path d="M300 210 L356 202 L374 246 L348 292 L296 286 L284 246 Z" />
      </g>
      {/* Avenidas – casco mais escuro + asfalto claro */}
      <g stroke="#d8ceb5" strokeLinecap="round" fill="none">
        <path d="M-20 190 L420 132" strokeWidth="18" />
        <path d="M166 -20 L112 340" strokeWidth="18" />
        <path d="M-20 64 L420 96" strokeWidth="13" />
      </g>
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        <path d="M-20 190 L420 132" strokeWidth="9" />
        <path d="M166 -20 L112 340" strokeWidth="9" />
        <path d="M-20 64 L420 96" strokeWidth="7" />
      </g>
      {/* Ruas secundárias */}
      <g stroke="#ffffff" strokeLinecap="round" fill="none" strokeWidth="5">
        <path d="M-20 30 L420 44" />
        <path d="M-20 150 L420 126" />
        <path d="M-20 236 L420 268" />
        <path d="M-20 306 L420 320" />
        <path d="M58 -20 L40 340" />
        <path d="M256 -20 L288 340" />
        <path d="M348 -20 L318 340" />
        <path d="M12 -20 L2 340" />
      </g>
    </svg>
  )
}

/**
 * AboutSection – bloco "Sobre" (design 68:3866): descrição do restaurante,
 * lista "O que você pode aproveitar" (comodidades em 2 colunas) e o card de
 * "Localização" (tile de mapa + endereço + botão "Como chegar").
 *
 * Desvio: sem asset de mapa, o tile usa um mapa vetorial estilizado de SP
 * (SVG inline) com o pin central sobreposto – placeholder em todas as lojas.
 */
export default function AboutSection({ merchant }: AboutSectionProps) {
  return (
    <section id="sobre" className="about-section">
      <div className="about-section__block">
        <h2 className="about-section__title">Sobre o restaurante</h2>
        <p className="about-section__description">
          {merchant.about} <span className="about-section__more">Ler mais</span>
        </p>
      </div>

      <div className="about-section__block">
        <h2 className="about-section__title">O que você pode aproveitar</h2>
        <ul className="about-section__amenities">
          {merchant.amenities.map((amenity) => (
            <li className="about-section__amenity" key={amenity.label}>
              <Icon name={amenity.icon} size={20} />
              <span>{amenity.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="about-section__block">
        <h2 className="about-section__title">Localização</h2>

        <div className="about-section__location">
          <div className="about-section__map" aria-hidden="true">
            <MapPlaceholder />
            {/* Halo claro + sombra sob o pin, como um marcador de mapa (68:4065) */}
            <span className="about-section__map-pin">
              <Icon name="pin" size={41} />
            </span>
          </div>

          <div className="about-section__location-body">
            <p className="about-section__address">{merchant.address}</p>
            <button type="button" className="about-section__route">
              <Icon name="route" style="Line" size={16} />
              Como chegar
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
