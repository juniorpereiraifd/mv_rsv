import { Link, Navigate, useParams } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import { getMerchantUI } from '../../data/merchants.ui'
import './MensagensFlow.css'
import './ChatPage.css'

/** Copy estática do card de oferta da mensagem (espírito do mock do frame –
 * o catálogo não modela a contagem de check-ins nem a validade da promo). */
const LOYALTY_CAPTION = 'Oportunidade'

/**
 * ChatPage – rota `/mensagens/:slug` (Figma 163:4192): o chat 1:1 com um
 * restaurante, fake door. Header com voltar (→ `/mensagens`), o logo centralizado
 * (avatar 40 redondo com ring branco) e o botão-pill "Detalhes" (→ página da
 * loja). Conteúdo: UMA mensagem recebida do restaurante – uma bolha #f5f5f5 com
 * o avatar 24 do parceiro e o card "Oportunidade" (estático, decisão do usuário:
 * sem campo de envio/teclado). O card anuncia o benefício real da loja
 * (`merchant.offers[0]`) e o CTA "Conferir benefício" navega à BeneficioPage.
 *
 * Desvio documentado (convenções do app): a copy do card usa a oferta real do
 * catálogo no lugar do mock fixo do frame ("Você tem 9 check-ins… 50% OFF /
 * Válido até 12 jun") que o app não modela.
 */
export default function ChatPage() {
  const { slug } = useParams()
  const merchant = getMerchantUI(slug)
  if (!merchant) return <Navigate to="/mensagens" replace />

  const offer = merchant.offers[0]

  return (
    <div className="mensagens-page">
      {/* Header (163:4237) – voltar (→ lista), logo central com ring branco e o
          pill "Detalhes" (→ loja). O `::after` do toolbar é neutralizado aqui:
          o bloco "Detalhes" (40px) ocupa o lado direito. */}
      <div className="mensagens-toolbar mensagens-toolbar--chat">
        <Link
          to="/mensagens"
          className="mensagens-toolbar__back"
          aria-label="Voltar para as mensagens"
        >
          <Icon name="back" style="Line" size={24} />
        </Link>

        <div className="chat-header">
          <img className="chat-header__avatar" src={merchant.logo} alt="" />
        </div>

        <Link to={`/loja/${merchant.slug}`} className="chat-header__details">
          Detalhes
        </Link>
      </div>

      <main className="mensagens-page__main">
        <div className="mensagens-page__inner chat-page">
          {/* Mensagem recebida (163:4193) – avatar 24 do restaurante + bolha
              #f5f5f5 com o card "Oportunidade". O avatar fica do lado de fora
              da bolha, ancorado na base dela (cauda no canto inferior
              esquerdo, raio 4). */}
          <div className="chat-bubble">
            <span className="chat-bubble__avatar">
              <img className="chat-bubble__avatar-img" src={merchant.logo} alt="" />
            </span>

            <article className="chat-card">
              <header className="chat-card__head">
                <span className="chat-card__tag">
                  <Icon name="fire" size={12} />
                  {LOYALTY_CAPTION}
                </span>
              </header>

              <p className="chat-card__title">{offer.title}</p>
              <p className="chat-card__subtitle">{offer.subtitle}</p>

              <Link to={`/loja/${merchant.slug}/beneficio/0`} className="chat-card__cta">
                Conferir benefício
              </Link>
            </article>
          </div>
        </div>
      </main>
    </div>
  )
}
