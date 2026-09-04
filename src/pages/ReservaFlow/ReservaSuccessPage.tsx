import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getMerchantUI } from '../../data/merchants.ui'
import { hasReservaOffer, isReservaSnapshot } from '../../data/reserva'
import ReservaTicket from './ReservaTicket'
import ReservaReward from './ReservaReward'
import './ReservaFlow.css'
import './ReservaSuccessPage.css'

/**
 * ReservaSuccessPage – rota `/loja/:slug/reserva/sucesso` (Figma
 * cMhyOvWvhsuRtOjTLvFvDH, node 125:12026): estado final do fluxo, alcançado
 * pela página de confirmação depois da animação (sempre com `replace`, então
 * o back do navegador não volta pro overlay). Sem toolbar/back por design.
 *
 * Conteúdo `pt 98`: cabeçalho centralizado (mark de sucesso 64px + "Reserva
 * Confirmada" + texto do e-mail) e o mesmo ticket + voucher da revisão (sem o
 * campo Observação). CTA "Ver minhas reservas" → `/perfil`.
 *
 * Guards iguais aos da confirmação: sem `location.state` (refresh / acesso
 * direto), slug trocado ou loja sem oferta de reserva → volta à loja.
 */
export default function ReservaSuccessPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const merchant = getMerchantUI(slug)
  const snapshot = isReservaSnapshot(location.state) ? location.state : null

  if (!merchant) return <Navigate to="/" replace />
  if (!snapshot || snapshot.merchantSlug !== merchant.slug || !hasReservaOffer(merchant)) {
    return <Navigate to={`/loja/${merchant.slug}`} replace />
  }

  const reward = merchant.offers[snapshot.offerIndex] ?? merchant.offers[0]

  return (
    <div className="reserva-page reserva-success">
      <main className="reserva-page__main">
        <div className="reserva-page__inner">
          {/* Cabeçalho de sucesso (125:12031): check verde 64px + título +
              aviso do e-mail, tudo centralizado. */}
          <div className="reserva-success__head">
            <div className="reserva-success__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
                <path
                  d="M4.5 12.6l4.6 4.6 10.4-10.8"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="reserva-success__title">Reserva Confirmada</h1>
            <p className="reserva-success__sub">
              Um e-mail de confirmação foi enviado para você.
            </p>
          </div>

          <ReservaTicket merchant={merchant} snapshot={snapshot} />
          <ReservaReward merchant={merchant} reward={reward} />
        </div>
      </main>

      <footer className="reserva-page__footer">
        <div className="reserva-page__footer-inner">
          <button
            type="button"
            className="reserva-page__cta"
            onClick={() => navigate('/perfil')}
          >
            Ver minhas reservas
          </button>
        </div>
      </footer>
    </div>
  )
}
