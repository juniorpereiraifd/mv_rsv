import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StickyFooter.css'
import BottomSheet from '../../../components/BottomSheet/BottomSheet'
import Icon from '../../../components/Icon/Icon'
import { useCheckins } from '../../../context/CheckinProvider'
import type { Merchant } from '../../../data/merchants'

/**
 * StickyFooter – barra fixa na base da página (design 68:3832): "Avaliar"
 * (superfície secundária) + botão de check-in.
 *
 * O check-in reflete o estado global (CheckinProvider):
 *  - carregando → desabilitado (ainda não se sabe se a loja já tem check-in);
 *  - não feito   → CTA "Fazer check-in" na cor da marca (primário);
 *  - feito       → "Check-in realizado" (ícone check verde + superfície de
 *                  sucesso), desabilitado – o estado persiste após o reload
 *                  porque o check-in fica salvo no fake back-end.
 * `position: sticky` mantém a barra visível enquanto a página rola.
 *
 * O check-in só existe nas lojas ELEGÍVEIS (ver RestaurantPage → canCheckIn):
 * oferta no local, sem tag de reserva e sem tag de fidelidade. Reserva (widget
 * "Reserva de Mesa") e fidelidade (cartela de selos) ficam sem o CTA – o rodapé
 * só com "Avaliar".
 *
 * Fluxo do CTA (design 129-14434 e 129-14456): o clique NÃO conclui o check-in
 * direto – abre um bottom sheet pedindo confirmação ("Quer confirmar o check-in
 * em {loja}?"). Ao confirmar, o logo da loja vira um loading e roda a validação
 * de localização simulada (fakedoor); ao fim, o check-in é registrado e o app
 * redireciona para a tela de benefício concluída (`/loja/:slug/beneficio/0` –
 * o "Mostre a tela ao atendente" pós-check-in da BeneficioPage).
 */
interface StickyFooterProps {
  /** Loja – dados (nome/logo/slug) usados pelo CTA e pela sheet. */
  merchant: Merchant
  /** true = loja elegível, mostra o botão de check-in. false = reserva ou
   * fidelidade, sem CTA (só "Avaliar"). */
  showCheckIn: boolean
}

/** Duração da validação de localização simulada (fakedoor) antes de concluir o
 * check-in e redirecionar – mesma linguagem do loading do ReservaFlow. */
const FAKEDOOR_MS = 1600

/** Oferta de destino do pós-check-in: a 1ª oferta da loja (índice 0). O CTA do
 * rodapé não tem contexto de oferta, então espelha o topo do carrossel
 * "Benefício pra você". */
const CHECKIN_OFFER_INDEX = 0

export default function StickyFooter({ merchant, showCheckIn }: StickyFooterProps) {
  const { slug } = merchant
  const { checkedIn, checkIn, loading } = useCheckins()
  const navigate = useNavigate()
  const done = checkedIn(slug)

  // Fases do fluxo: sheet de confirmação aberta (`open`) e, após o "Sim,
  // confirmar", a validação de localização (`validating`) – durante ela a sheet
  // não pode ser descartada e o CTA não refaz o clique.
  const [open, setOpen] = useState(false)
  const [validating, setValidating] = useState(false)
  const timerRef = useRef<number | null>(null)

  // Não agenda setState se o usuário sair da loja no meio do fakedoor.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  /** Fecha a sheet (Cancelar / tocar fora / Escape) – travado na validação. */
  const closeSheet = () => {
    if (validating) return
    setOpen(false)
  }

  /** "Sim, confirmar": troca o logo pelo loading, roda a validação simulada e,
   * ao concluir, registra o check-in e redireciona para o benefício concluído. */
  const confirmCheckIn = () => {
    if (validating) return
    setValidating(true)
    const wait = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : FAKEDOOR_MS
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      void (async () => {
        // Otimista: o provider reverte em caso de falha de rede.
        const ok = await checkIn(slug)
        setValidating(false)
        setOpen(false)
        if (ok) navigate(`/loja/${slug}/beneficio/${CHECKIN_OFFER_INDEX}`)
      })()
    }, wait)
  }

  return (
    <>
      <footer className="sticky-footer">
        <button type="button" className="sticky-footer__action">
          Avaliar
        </button>
        {showCheckIn && (
          <button
            type="button"
            className={`sticky-footer__action sticky-footer__action--checkin${done ? ' sticky-footer__action--checkin--done' : ''}`}
            disabled={done || loading}
            onClick={() => {
              // O CTA abre a confirmação – o check-in só acontece ao concluir a
              // validação de localização (ver confirmCheckIn).
              setOpen(true)
            }}
          >
            {done && <Icon name="check" size={18} />}
            {done ? 'Check-in realizado' : 'Fazer check-in'}
          </button>
        )}
      </footer>

      <BottomSheet
        open={open}
        onClose={closeSheet}
        dismissible={!validating}
        label={validating ? 'Validando sua localização' : 'Confirmar check-in'}
      >
        {validating ? (
          <div className="checkin-sheet checkin-sheet--validating">
            <span className="checkin-sheet__loading" aria-hidden="true" />
            <p className="checkin-sheet__status" role="status">
              Estamos validando sua localização...
            </p>
          </div>
        ) : (
          <div className="checkin-sheet">
            <span className="checkin-sheet__logo">
              <img className="checkin-sheet__logo-img" src={merchant.logo} alt="" />
            </span>
            <div className="checkin-sheet__text">
              <h2 className="checkin-sheet__title">
                Quer confirmar o check-in em {merchant.name}?
              </h2>
              <p className="checkin-sheet__subtitle">
                O check-in libera seu benefício por tempo limitado
              </p>
            </div>
            <div className="checkin-sheet__actions">
              <button
                type="button"
                className="checkin-sheet__action checkin-sheet__action--ghost"
                onClick={closeSheet}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="checkin-sheet__action checkin-sheet__action--primary"
                onClick={confirmCheckIn}
              >
                Sim, confirmar
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}
