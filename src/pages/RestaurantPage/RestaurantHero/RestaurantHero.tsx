import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon/Icon'
import type { Merchant } from '../../../data/merchants'
import './RestaurantHero.css'

interface RestaurantHeroProps {
  merchant: Merchant
}

/**
 * RestaurantHero – imagem de capa full-bleed (design 68:3751, 372px) com um
 * gradiente de leitura e a toolbar sobreposta (bloco "Wrap" 64:2633): botão de
 * voltar (`Link to="/"`) à esquerda e compartilhar à direita, círculos 44px com
 * fundo translúcido e blur (design 68:4078).
 *
 * Desvio documentado: a barra de status do iOS (9:41 / Dynamic Island / bateria)
 * é chrome de celular e foi omitida – a app é um frame web de 834px.
 */
export default function RestaurantHero({ merchant }: RestaurantHeroProps) {
  return (
    <div className="restaurant-hero">
      <img className="restaurant-hero__image" src={merchant.image} alt="" />

      <div className="restaurant-hero__gradient" aria-hidden="true" />

      <div className="restaurant-hero__toolbar">
        <Link to="/" className="restaurant-hero__btn" aria-label="Voltar para a home">
          <Icon name="back" style="Line" size={24} />
        </Link>
        <button type="button" className="restaurant-hero__btn" aria-label="Compartilhar">
          <Icon name="share" style="Line" size={24} />
        </button>
      </div>
    </div>
  )
}
