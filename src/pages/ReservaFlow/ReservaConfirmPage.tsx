import { useCallback, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import { getMerchantUI } from '../../data/merchants.ui'
import { hasReservaOffer, isReservaSnapshot } from '../../data/reserva'
import { useReservas } from '../../context/ReservaProvider'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import ReservaTicket from './ReservaTicket'
import ReservaReward from './ReservaReward'
import ReservaOverlay from './ReservaOverlay'
import './ReservaFlow.css'
import './ReservaConfirmPage.css'

/** Placeholder do campo Observação (node 125:12216) – só visual, sem backend. */
const NOTE_PLACEHOLDER = 'Adicione alguma observação ou pedido especial...'

/**
 * ReservaConfirmPage – rota `/loja/:slug/reserva/confirmar` (Figma
 * cMhyOvWvhsuRtOjTLvFvDH, node 125:12123 "Revisão"): a tela de confirmação da
 * reserva escolhida no widget `ReservaSection`. Chegou aqui via
 * `location.state` (snapshot) no clique em "Reservar" — sem state, refresh ou
 * slug errado redireciona (guard) pra loja (ou `/` se a loja não existe).
 *
 * Conteúdo branco: ticket da reserva + voucher da recompensa + campo
 * Observação. O CTA "Confirmar reserva" NÃO vai direto ao sucesso: monta o
 * `ReservaOverlay` (spinner → confete, CSS puro) e, ao fim dele, navega com
 * `replace` ao `/sucesso`. Com `prefers-reduced-motion` o overlay nem monta —
 * navega direto (a animação é só enfeite; a confirmação não pode ficar presa
 * a ela). Enquanto o overlay está no ar, o conteúdo atrás recebe `inert` e o
 * scroll do body fica travado (gerido no overlay).
 */
export default function ReservaConfirmPage() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const merchant = getMerchantUI(slug)

  /* Type guard já estreita o state pra ReservaSnapshot | null (null = sem
     state / shape inválido → guard abaixo manda de volta à loja). */
  const snapshot = isReservaSnapshot(location.state) ? location.state : null

  const [showOverlay, setShowOverlay] = useState(false)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { recordReserva } = useReservas()

  /** Commit da reserva + navega ao sucesso com `replace`. A confirmação é o
   * ponto único que grava a reserva no store do perfil (`recordReserva`), num
   * handler – nunca num effect (o StrictMode duplicaria a gravação em dev). O
   * botão voltar/navegador voltam pra loja, e o sucesso só é alcançável aqui. */
  const goSuccess = useCallback(() => {
    if (!snapshot) return
    recordReserva(snapshot)
    navigate(`/loja/${slug}/reserva/sucesso`, { state: snapshot, replace: true })
  }, [navigate, slug, snapshot, recordReserva])

  /* Guards (hooks todos acima – ordem estável): loja inexistente → `/`; state
     ausente/inválido, loja trocada na URL ou sem oferta de reserva → loja. */
  if (!merchant) return <Navigate to="/" replace />
  if (!snapshot || snapshot.merchantSlug !== merchant.slug || !hasReservaOffer(merchant)) {
    return <Navigate to={`/loja/${merchant.slug}`} replace />
  }

  const reward = merchant.offers[snapshot.offerIndex] ?? merchant.offers[0]

  return (
    <div className="reserva-page">
      {/* Chrome (toolbar + conteúdo + CTA) – recebe `inert` enquanto o overlay
          está no ar pra foco/tab não saírem do overlay. */}
      <div className="reserva-confirm" inert={showOverlay || undefined}>
        {/* Toolbar (125:12130): círculo de voltar + título centralizado. Voltar
            descarta a reserva e retorna à loja (a seleção do widget zera – ok). */}
        <div className="reserva-confirm__toolbar">
          <Link
            to={`/loja/${merchant.slug}`}
            className="reserva-confirm__back"
            aria-label="Voltar para a loja"
          >
            <Icon name="back" style="Line" size={24} />
          </Link>
          <h1 className="reserva-confirm__title">Confirme as informações</h1>
        </div>

        <main className="reserva-page__main">
          <div className="reserva-page__inner">
            <ReservaTicket merchant={merchant} snapshot={snapshot} />
            <ReservaReward merchant={merchant} reward={reward} />

            {/* Campo Observação (125:12216) – caixa #f5f5f5 com textarea branco.
                Sem backend: o valor é visual e não persiste. */}
            <div className="reserva-confirm__note">
              <span className="reserva-confirm__note-label">Observação</span>
              <textarea
                className="reserva-confirm__note-input"
                rows={2}
                placeholder={NOTE_PLACEHOLDER}
                name="observacao"
              />
            </div>
          </div>
        </main>

        <footer className="reserva-page__footer">
          <div className="reserva-page__footer-inner">
            <button
              type="button"
              className="reserva-page__cta"
              onClick={() => {
                if (reduceMotion) {
                  goSuccess()
                  return
                }
                setShowOverlay(true)
              }}
            >
              Confirmar reserva
            </button>
          </div>
        </footer>
      </div>

      {/* Overlay transiente – quando termina chama goSuccess (navega ao sucesso
          com replace). Só monta sem reduced-motion (navegação direta acima). */}
      {showOverlay && <ReservaOverlay onDone={goSuccess} />}
    </div>
  )
}
