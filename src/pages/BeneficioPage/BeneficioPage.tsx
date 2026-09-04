import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import BottomSheet from '../../components/BottomSheet/BottomSheet'
import Icon from '../../components/Icon/Icon'
import Rating from '../../components/Rating/Rating'
import { getMerchantUI } from '../../data/merchants.ui'
import { useCheckins } from '../../context/CheckinProvider'
import StampCard, { STAMP_CARD_LIMIT } from '../../components/StampCard/StampCard'
import ticketUrl from '../../assets/card/bg-beneficio.svg'
import './BeneficioPage.css'

/**
 * BeneficioPage – detalhe de um benefício anunciado no offer card (Figma
 * 95:6301 "Benefício"). O design é um sheet modal de 393×856; como o pedido é
 * "abrir outra página", a tela virou uma página full-height no container da app
 * (834px) com o mesmo conteúdo: foto do restaurante desfocada + overlay escuro,
 * botão de voltar, o texto "Benefícios pra você / Faça o check-in…", o ticket
 * do benefício (card de cupom com foto, merchant e título/subtítulo da oferta)
 * e as CTAs "Fazer check-in" + "Ver detalhes e regras".
 *
 * "Ver detalhes e regras" abre o BottomSheet com as regras da oferta (design
 * 97:6949 "cupom off only"): título "Detalhes e regras", os passos "Como usar"
 * e a lista "Regras" da oferta (o token `{merchant}` do template vira o nome
 * da loja).
 *
 * O botão "Fazer check-in" muda a página para o estado pós-check-in (design
 * 100:7744 "Pós"): o texto do topo vira "Mostre a tela ao atendente…", o botão
 * desabilita como "Check-in realizado" (check verde + fundo terciário) e uma
 * tag de expiração ("Expira em 3h 59min") aparece no canto do cupom.
 *
 * Para lojas com `cardTags: "fidelidade"` (Figma "-Move--Comer-Fora": cartela
 * vazia 123:9266, em progresso/completa 124:10513 e recompensa 123:9785) o
 * ticket inteiro é substituído pela cartela de selos (StampCard): cada check-in
 * soma +1 selo com a logo da loja, o CTA fica ativo até a cartela encher
 * (`STAMP_CARD_LIMIT`, então vira "Cartela completa") e o card alterna as faces
 * "cartela" ⇄ "recompensa". Lojas sem a tag seguem com o cupom e o check-in
 * único (1 por loja), como descrito acima.
 *
 * Rota: `/loja/:slug/beneficio/:offerIndex`. Índice fora do range ou slug
 * inválido redireciona de volta à página da loja.
 *
 * Desvios documentados (mesma decisão do RestaurantHero): barra de status do
 * iOS omitida e raio de 56px do sheet trocado pela página inteira.
 */
/** Passos "Como usar" do bottom sheet – fixos no design 97:6949 (iguais para
 * todas as ofertas). */
const COMO_USAR = [
  'Mostre a tela ao atendente pra validação de regras',
  'Peça o item em promoção e aproveite!',
]

/** Texto da tag de expiração do estado "Check-in realizado" (design 100:7853) –
 * fixo como no protótipo. */
const EXPIRES_LABEL = 'Expira em 3h 59min'

export default function BeneficioPage() {
  const { slug, offerIndex } = useParams()
  const merchant = getMerchantUI(slug)
  const [showRules, setShowRules] = useState(false)
  // Estado do check-in vem do contexto global (persiste no fake back-end) – a
  // página reflete o mesmo "Check-in realizado" que o StickyFooter e a home.
  const { checkedIn, stampsOf, checkIn } = useCheckins()

  const index = Number(offerIndex)
  const offer =
    merchant && Number.isInteger(index) && index >= 0 && index < merchant.offers.length
      ? merchant.offers[index]
      : undefined

  if (!merchant || !offer) {
    return <Navigate to={merchant ? `/loja/${merchant.slug}` : '/'} replace />
  }

  /** Regras com o token `{merchant}` do template substituído pelo nome da loja. */
  const regras = offer.regras.map((rule) => rule.replace(/\{merchant\}/g, merchant.name))
  // `done` espelha o estado global do check-in desta loja (mesmo marcador do
  // StickyFooter e da home). Lojas com a tag "fidelidade" trocam o ticket de
  // cupom pela cartela de selos (StampCard): o CTA fica ativo até a cartela
  // encher (`stamps` chega a `STAMP_CARD_LIMIT`); nas demais, 1 check-in já
  // desabilita o CTA (`ctaDone` = `done`).
  const done = checkedIn(merchant.slug)
  const isFidelity = merchant.cardTags === 'fidelidade'
  const stamps = stampsOf(merchant.slug)
  const cartelaFull = isFidelity && stamps >= STAMP_CARD_LIMIT
  const ctaDone = isFidelity ? cartelaFull : done

  return (
    <div className="beneficio-page">
      <div
        className="beneficio-page__bg"
        style={{ backgroundImage: `url(${merchant.image})` }}
        aria-hidden="true"
      />
      <div className="beneficio-page__overlay" aria-hidden="true" />

      <div className="beneficio-page__toolbar">
        <Link to={`/loja/${merchant.slug}`} className="beneficio-page__back" aria-label="Voltar para a loja">
          <Icon name="back" style="Line" size={24} />
        </Link>
      </div>

      <main className="beneficio-page__content">
        <div className="beneficio-page__text">
          <p className="beneficio-page__caption">Benefícios pra você</p>
          <h1 className="beneficio-page__heading">
            {done ? (
              <>
                Mostre a tela ao atendente,
                <br />
                pra validar regras
              </>
            ) : (
              <>
                Faça o check-in para
                <br />
                ativar o benefício e aproveitar
              </>
            )}
          </h1>
        </div>

        {isFidelity ? (
          <StampCard merchant={merchant} stamps={stamps} />
        ) : (
          <article className="beneficio-card">
            <img className="beneficio-card__bg" src={ticketUrl} alt="" aria-hidden="true" />

            <div
              className="beneficio-card__photo"
              style={{ backgroundImage: `url(${merchant.image})` }}
              aria-hidden="true"
            />

            <div className="beneficio-card__merchant">
              <span className="beneficio-card__avatar">
                <img className="beneficio-card__logo" src={merchant.logo} alt="" />
              </span>
              <div className="beneficio-card__info">
                <p className="beneficio-card__name">{merchant.name}</p>
                <div className="beneficio-card__meta">
                  <Rating
                    variant={merchant.ratingVariant}
                    value={merchant.ratingValue}
                    count={merchant.ratingCount}
                  />
                  <span className="beneficio-card__dot" aria-hidden="true">
                    •
                  </span>
                  <span className="beneficio-card__distance">{merchant.distance}</span>
                </div>
              </div>
            </div>

            <div className="beneficio-card__coupon">
              <h2 className="beneficio-card__title">{offer.title}</h2>
              <p className="beneficio-card__subtitle">{offer.subtitle}</p>
              {done && <span className="beneficio-card__expires">{EXPIRES_LABEL}</span>}
            </div>
          </article>
        )}
      </main>

      <footer className="beneficio-page__footer">
        <button
          type="button"
          className={`beneficio-page__cta beneficio-page__cta--checkin${ctaDone ? ' beneficio-page__cta--done' : ''}`}
          onClick={() => {
            // Atualização otimista: o provider reverte em caso de falha de rede.
            void checkIn(merchant.slug)
          }}
          disabled={ctaDone}
        >
          {ctaDone ? (
            <>
              <Icon name="check" size={21} />
              {isFidelity ? 'Cartela completa' : 'Check-in realizado'}
            </>
          ) : (
            'Fazer check-in'
          )}
        </button>
        <button
          type="button"
          className="beneficio-page__cta beneficio-page__cta--details"
          onClick={() => setShowRules(true)}
        >
          Ver detalhes e regras
        </button>
      </footer>

      <BottomSheet open={showRules} onClose={() => setShowRules(false)} label="Detalhes e regras">
        <h2 className="rules-sheet__title">Detalhes e regras</h2>
        <div className="rules-sheet__sections">
          <section className="rules-sheet__section">
            <h3 className="rules-sheet__heading">Como usar</h3>
            <ul className="rules-sheet__list">
              {COMO_USAR.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="rules-sheet__section">
            <h3 className="rules-sheet__heading">Regras</h3>
            <ul className="rules-sheet__list">
              {regras.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </BottomSheet>
    </div>
  )
}
