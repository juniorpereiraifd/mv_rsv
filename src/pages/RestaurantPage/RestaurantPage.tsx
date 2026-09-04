import { Navigate, useParams } from 'react-router-dom'
import { getMerchantUI } from '../../data/merchants.ui'
import type { Merchant } from '../../data/merchants'
import RestaurantHero from './RestaurantHero/RestaurantHero'
import RestaurantHeader from './RestaurantHeader/RestaurantHeader'
import RestaurantTabs from './RestaurantTabs/RestaurantTabs'
import OfferSection from './OfferSection/OfferSection'
import ReservaSection from './ReservaSection/ReservaSection'
import GallerySection from './GallerySection/GallerySection'
import ReviewsSection from './ReviewsSection/ReviewsSection'
import AboutSection from './AboutSection/AboutSection'
import StickyFooter from './StickyFooter/StickyFooter'
import './RestaurantPage.css'

/**
 * Página do restaurante (Figma 68:3750 "Pagina_Rest") – a tela completa do
 * design, populada com os dados próprios de cada loja (fonte única:
 * `src/data/merchants.ts`).
 *
 * Estrutura (topo → base):
 *   1. Hero 372px full-bleed (imagem + gradiente) com a toolbar (voltar/compartilhar)
 *   2. Corpo branco com canto superior arredondado (32px) sobreposto ao hero –
 *      header (nome/meta/status), tabs com underline e as seções de conteúdo
 *   3. Rodapé fixo `position: sticky` ("Avaliar" / "Fazer check-in")
 *
 * Rota: `/loja/:slug`. Slug inválido redireciona à home (`/`).
 */
/** True quando a loja tem oferta de reserva (availability "Reserva", ex.
 * ["Reserva","No local"]) → a seção "Benefício pra você" vira o widget
 * "Reserva de Mesa". As demais seguem com o `OfferSection`. */
function isReservaMerchant(merchant: Merchant): boolean {
  return merchant.offers.some((offer) => offer.availability.includes('Reserva'))
}

/** Elegibilidade do CTA de check-in do rodapé (regra do mapeamento): APENAS
 * lojas que NÃO têm tag de reserva E NÃO têm tag de fidelidade. As de reserva
 * abrem o widget "Reserva de Mesa" e as de fidelidade usam a cartela de selos
 * (StampCard) com check-in próprio — nenhuma das duas mostra o CTA. */
function canCheckIn(merchant: Merchant): boolean {
  return !isReservaMerchant(merchant) && merchant.cardTags !== 'fidelidade'
}

export default function RestaurantPage() {
  const { slug } = useParams()
  const merchant = getMerchantUI(slug)

  if (!merchant) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="restaurant-page">
      <RestaurantHero merchant={merchant} />

      <div className="restaurant-page__body">
        <RestaurantHeader merchant={merchant} />
        <RestaurantTabs />

        <main className="restaurant-page__content">
          {isReservaMerchant(merchant) ? (
            <ReservaSection merchant={merchant} />
          ) : (
            <OfferSection merchant={merchant} />
          )}
          <GallerySection merchant={merchant} />
          <ReviewsSection merchant={merchant} />
          <AboutSection merchant={merchant} />
        </main>
      </div>

      {/* Check-in só nas lojas elegíveis (sem reserva e sem fidelidade) – o CTA
          abre a sheet de confirmação + validação de localização antes de
          concluir. Reserva/fidelidade ficam sem o CTA no rodapé. */}
      <StickyFooter merchant={merchant} showCheckIn={canCheckIn(merchant)} />
    </div>
  )
}
