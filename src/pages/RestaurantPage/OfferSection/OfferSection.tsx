import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon/Icon'
import type { Merchant } from '../../../data/merchants'
import './OfferSection.css'

/**
 * Prato da culinária usado como fallback da foto da oferta quando a loja não tem
 * galeria (aceite: "foto de prato genérico daquela culinária específica da
 * internet"). Uma URL por categoria presente nas lojas Comer Fora
 * (`merchant.category`); imagens estáveis e livres no Wikimedia Commons. Cada
 * URL foi verificada com HTTP 200 antes de fixada no código — mesmo critério
 * usado nas URLs de mídia de `src/data/photos.ts`.
 */
const CUISINE_DISH: Record<string, string> = {
  Brasileira:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Feijoada_%C3%A0_brasileira_1.jpg/960px-Feijoada_%C3%A0_brasileira_1.jpg',
  'Frutos Do Mar':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Plateau_de_fruits_de_mer_001.jpg/960px-Plateau_de_fruits_de_mer_001.jpg',
  Italiana:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Spaghetti_alla_Carbonara.jpg/960px-Spaghetti_alla_Carbonara.jpg',
  Cafeteria:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Coffee_and_coffee_cake_%28Unsplash%29.jpg/960px-Coffee_and_coffee_cake_%28Unsplash%29.jpg',
  'Doces & Bolos':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Chocolate_fudge_cake.jpg/500px-Chocolate_fudge_cake.jpg',
  Mexicana:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tacos_al_pastor.jpg/960px-Tacos_al_pastor.jpg',
  Lanches:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gourmet_soup_and_sandwich.jpg/960px-Gourmet_soup_and_sandwich.jpg',
  Saudável:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Food-salad-healthy-vegetables-1_%2823959011279%29.jpg/960px-Food-salad-healthy-vegetables-1_%2823959011279%29.jpg',
  Francesa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Croissants_au_beurre_%2818953292873%29.jpg/960px-Croissants_au_beurre_%2818953292873%29.jpg',
  Japonesa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Sushi_roll.jpg/500px-Sushi_roll.jpg',
  Pizza:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Margherita_pizza_on_plate.jpg/960px-Margherita_pizza_on_plate.jpg',
  Hambúrguer:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cheeseburger.jpg/960px-Cheeseburger.jpg',
  Carnes:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Churrasco_Campeiro.jpg/960px-Churrasco_Campeiro.jpg',
}

/** Último recurso do fallback: prato genérico, p/ categoria fora do mapa. */
const GENERIC_DISH =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Delicious_gourmet_dish_served_at_a_restaurant_highlighting_tender_meat_undefined.jpg/960px-Delicious_gourmet_dish_served_at_a_restaurant_highlighting_tender_meat_undefined.jpg'

/**
 * Foto que referencia a oferta (aceite): 1ª foto real da galeria da loja; sem
 * galeria, um prato da culinária (`CUISINE_DISH[merchant.category]`); fora do
 * mapa de culinárias, o prato genérico (`GENERIC_DISH`).
 *
 * Exportada só pra viabilizar o teste de fallback (função pura com uma loja
 * sintética sem galeria); no app ela roda dentro do `OfferSection`.
 */
export function offerPhoto(merchant: Merchant): string {
  const specific = merchant.gallery.find((url) => url.length > 0)
  if (specific) return specific
  return CUISINE_DISH[merchant.category] ?? GENERIC_DISH
}

interface OfferSectionProps {
  merchant: Merchant
}

/**
 * OfferSection – bloco "Benefício pra você" (design 68:3801): sobre a
 * superfície secundária (68:3805), o card da oferta (foto, título, subtítulo e
 * pills de disponibilidade) e, abaixo, o bloco "Ganhe também" (68:3833) com o
 * losango do Clube.
 *
 * Consistência com o card externo (aceite): o bloco anuncia UMA oferta — a
 * PRIMÁRIA (`merchant.offers[0]`), gerada em build a partir do MESMO
 * `merchant.cardTags` que pinta a pill do card da home
 * (scripts/build_catalog.mjs → makePrimaryOffer(TAG_BENEFIT[cardTags])). A
 * secundária ("Combo …" genérica), que o card externo não anuncia, deixa de
 * aparecer aqui. O array `offers` não muda (BeneficioPage lê por índice) — o
 * card aponta para o índice 0.
 */
export default function OfferSection({ merchant }: OfferSectionProps) {
  const promo = merchant.offers[0]

  return (
    <section id="ofertas" className="offer-section">
      <h2 className="offer-section__title">Benefício pra você</h2>

      <div className="offer-section__offers">
        <div className="offer-section__carousel">
          <Link to={`/loja/${merchant.slug}/beneficio/0`} className="offer-card offer-card--link">
            <img
              className="offer-card__photo"
              src={offerPhoto(merchant)}
              alt=""
              aria-hidden="true"
            />

            <div className="offer-card__content">
              <h3 className="offer-card__title">{promo.title}</h3>
              <p className="offer-card__subtitle">{promo.subtitle}</p>
              {promo.availability.length > 0 && (
                <div className="offer-card__availability">
                  {promo.availability.map((pill) => (
                    <span className="offer-card__pill" key={pill}>
                      {pill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className="offer-section__club">
          <h3 className="offer-section__club-label">Ganhe também</h3>
          <div className="offer-section__club-card">
            <span className="offer-section__club-icon">
              <Icon name="clube" size={16} />
            </span>
            <p className="offer-section__club-text">
              <strong>{merchant.clubOffer.title}</strong> <span>{merchant.clubOffer.note}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
