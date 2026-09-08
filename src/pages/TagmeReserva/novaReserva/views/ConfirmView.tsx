import type { Cliente, ReservaDraft } from '../reservaModel'
import { formatarData } from '../reservaModel'

interface LinhaProps {
  rotulo: string
  valor?: string
}

function LinhaResumo({ rotulo, valor }: LinhaProps) {
  if (!valor) return null
  return (
    <div className="nova-reserva__resumo-row">
      <span className="nova-reserva__resumo-label">{rotulo}</span>
      <span className="nova-reserva__resumo-value">{valor}</span>
    </div>
  )
}

interface ConfirmViewProps {
  cliente: Cliente | undefined
  draft: ReservaDraft
  onVoltar: () => void
  onConfirmar: () => void
}

/** ConfirmView – "Finalizando o preenchimento da reserva": resumo do que foi
 * escolhido + CTA "Confirmar reserva". */
export function ConfirmView({ cliente, draft, onVoltar, onConfirmar }: ConfirmViewProps) {
  const podeConfirmar = cliente != null && draft.horario != null

  return (
    <div className="nova-reserva__body nova-reserva__body--plain">
      <p className="nova-reserva__confirm-hint">
        Confira os dados abaixo antes de confirmar a reserva.
      </p>

      <div className="nova-reserva__resumo">
        <LinhaResumo rotulo="Cliente" valor={cliente?.nome} />
        <LinhaResumo
          rotulo="Data"
          valor={draft.horario ? `${formatarData(draft.data)} · ${draft.horario}` : undefined}
        />
        <LinhaResumo rotulo="Pessoas" valor={draft.horario ? String(draft.pessoas) : undefined} />
        <LinhaResumo rotulo="Salão" valor={draft.salao} />
        <LinhaResumo rotulo="Origem" valor={draft.origem} />
        <LinhaResumo rotulo="Status" valor={draft.status} />
        <LinhaResumo rotulo="Mesa" valor={draft.mesa} />
      </div>

      <div className="nova-reserva__form-actions nova-reserva__form-actions--confirm">
        <button type="button" className="nova-reserva__btn" onClick={onVoltar}>
          Voltar
        </button>
        <button
          type="button"
          className="nova-reserva__btn nova-reserva__btn--primary"
          disabled={!podeConfirmar}
          onClick={onConfirmar}
        >
          Confirmar reserva
        </button>
      </div>
    </div>
  )
}

interface SuccessViewProps {
  clienteNome: string
  onConcluir: () => void
}

/** SuccessView – estado de sucesso pós-confirmação (check + "Reserva
 * confirmada!"). Encerra o drawer ao tocar em "Concluir". */
export function SuccessView({ clienteNome, onConcluir }: SuccessViewProps) {
  return (
    <div className="nova-reserva__success">
      <span className="nova-reserva__success-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
          <path
            d="M4.5 12.6l4.6 4.6 10.4-10.8"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="nova-reserva__success-title">Reserva confirmada!</h2>
      <p className="nova-reserva__success-text">
        Reserva de <strong>{clienteNome}</strong> criada com sucesso.
      </p>
      <button
        type="button"
        className="nova-reserva__btn nova-reserva__btn--primary nova-reserva__success-cta"
        onClick={onConcluir}
      >
        Concluir
      </button>
    </div>
  )
}
