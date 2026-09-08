import Icon from '../../../components/Icon/Icon'
import type { ReservaPainel, StatusPainel } from './painelModel'
import './ReservaLista.css'

/** Ação disponível em um card de reserva. */
export type AcaoCard = 'aceitar' | 'rejeitar' | 'sentar' | 'cancelar' | 'notificar' | 'tag'

/** Rótulo curto por status – badge do topo do card. */
const ROTULO_STATUS: Record<StatusPainel, string> = {
  Nova: 'NOVO',
  Confirmada: 'CONFIRMADO',
  Aprovação: 'APROVAÇÃO',
  'No-show': 'NO-SHOW',
  Cancelada: 'CANCELADO',
  Sentado: 'SENTADO',
}

/** Cor do chip por status (classes já existentes + novas variantes). */
function badgeClass(status: StatusPainel): string {
  if (status === 'Confirmada' || status === 'Sentado') return ' tagme-reserva__badge--confirmado'
  if (status === 'Cancelada' || status === 'No-show') return ' tagme-reserva__badge--cancelado'
  if (status === 'Aprovação') return ' tagme-reserva__badge--aprovacao'
  return ' tagme-reserva__badge--novo'
}

interface ReservaListaProps {
  reservas: ReservaPainel[]
  onAcao: (reserva: ReservaPainel, acao: AcaoCard) => void
}

/**
 * ReservaLista – cards de reserva do Painel Hostess (aba Reserva). Cada card
 * replica o do artboard "Aba (Reserva)" e traz as ações do hostess: RSVP
 * (Aprovação) vira chip Aceitar/Rejeitar; os demais trazem Sentar/Notificar e
 * o menu ⋮ (Cancelar / + tag). Lista vazia → estado "Quando não tiver reserva".
 */
export function ReservaLista({ reservas, onAcao }: ReservaListaProps) {
  if (reservas.length === 0) {
    return (
      <div className="painel-lista__empty">
        <Icon name="calendar" style="Line" size={28} />
        <p>Você ainda não tem reservas no momento para esse dia.</p>
        <span className="painel-lista__empty-hint">Escolha outro dia ou volte para hoje.</span>
      </div>
    )
  }

  return (
    <div className="painel-lista">
      {reservas.map((r) => (
        <CardReserva key={r.id} reserva={r} onAcao={onAcao} />
      ))}
    </div>
  )
}

function CardReserva({ reserva: r, onAcao }: { reserva: ReservaPainel; onAcao: ReservaListaProps['onAcao'] }) {
  // Solicitações RSVP (Aprovação) aguardam Aceitar/Rejeitar; canceladas/sentadas
  // viram só leitura (sem ações de encaminhamento).
  const pendente = r.status === 'Aprovação' || (r.status === 'Nova' && r.rsvp)
  const encerrada = r.status === 'Cancelada' || r.status === 'Sentado'
  const acoesVisiveis = !encerrada

  return (
    <article className="tagme-reserva__card painel-card">
      <div className="tagme-reserva__card-head">
        <span className={`tagme-reserva__badge${badgeClass(r.status)}`}>{ROTULO_STATUS[r.status]}</span>
        <span className="tagme-reserva__card-name">{r.cliente}</span>
        {r.mesa && <span className="tagme-reserva__card-code">Mesa {r.mesa}</span>}
      </div>

      <div className="tagme-reserva__card-tags">
        <span className={`tagme-reserva__chip${r.tag === 'Aniversário' ? ' tagme-reserva__chip--rsvp' : ''}`}>
          {r.tag}
        </span>
        {r.origem && <span className="tagme-reserva__chip">{r.origem}</span>}
      </div>

      {r.observacao && <p className="painel-card__obs">{r.observacao}</p>}

      <div className="tagme-reserva__card-row">
        <span className="tagme-reserva__card-time">{r.horario}</span>
        <span className="tagme-reserva__card-pax">{r.pessoas} pessoas</span>
      </div>

      {/* Ações do hostess por card */}
      {acoesVisiveis && (
        <div className="painel-card__actions">
          {pendente ? (
            <>
              <button
                type="button"
                className="painel-card__act painel-card__act--accept"
                onClick={() => onAcao(r, 'aceitar')}
              >
                Aceitar
              </button>
              <button
                type="button"
                className="painel-card__act painel-card__act--reject"
                onClick={() => onAcao(r, 'rejeitar')}
              >
                Rejeitar
              </button>
            </>
          ) : (
            <>
              <button type="button" className="painel-card__act" onClick={() => onAcao(r, 'sentar')}>
                Sentar cliente
              </button>
              <button type="button" className="painel-card__act" onClick={() => onAcao(r, 'notificar')}>
                Notificar
              </button>
              <button type="button" className="painel-card__act" onClick={() => onAcao(r, 'tag')}>
                + Tag
              </button>
              <button
                type="button"
                className="painel-card__act painel-card__act--cancel"
                onClick={() => onAcao(r, 'cancelar')}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      )}
    </article>
  )
}
