import { useState } from 'react'
import Icon from '../../../../components/Icon/Icon'
import PainelOverlay from '../PainelOverlay'
import {
  MENSAGENS_NOTIFICACAO,
  MESAS_DISPONIVEIS,
  MOTIVOS_CANCELAMENTO,
  TAGS_PAINEL,
  type ReservaPainel,
} from '../painelModel'
import './ReservaActions.css'

/* ------------------- Fragmentos compartilhados ------------------- */

interface RodapeAcaoProps {
  label: string
  disabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Rodapé Cancelar + CTA do overlay. */
export function RodapeAcao({ label, disabled, onConfirm, onCancel }: RodapeAcaoProps) {
  return (
    <footer className="painel-rsv__foot">
      <button type="button" className="painel-rsv__btn" onClick={onCancel}>
        Cancelar
      </button>
      <button
        type="button"
        className="painel-rsv__btn painel-rsv__btn--primary"
        disabled={disabled}
        onClick={onConfirm}
      >
        {label}
      </button>
    </footer>
  )
}

/** Campo rotulado com <select>. */
export function CampoSelect(props: {
  id: string
  rotulo: string
  value: string
  opcoes: string[]
  onChange: (v: string) => void
  placeholder?: string
}) {
  const { id, rotulo, value, opcoes, onChange, placeholder } = props
  return (
    <div className="painel-rsv__campo">
      <label className="painel-rsv__label" htmlFor={id}>
        {rotulo}
      </label>
      <div className="painel-rsv__select">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {placeholder && <option value="">{placeholder}</option>}
          {opcoes.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" style="Line" size={16} />
      </div>
    </div>
  )
}

/** Campo rotulado com <textarea>. */
export function CampoTexto(props: {
  id: string
  rotulo: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  const { id, rotulo, value, onChange, rows = 4, placeholder } = props
  return (
    <div className="painel-rsv__campo">
      <label className="painel-rsv__label" htmlFor={id}>
        {rotulo}
      </label>
      <textarea
        id={id}
        className="painel-rsv__textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/* ------------------- Aceitar / RSVP / Sentar ------------------- */

interface AceitarSentarProps {
  open: boolean
  reserva: ReservaPainel
  /** true → overlay "Aceitar reserva" (RSVP); false → "Sentar cliente". */
  aceitar: boolean
  onClose: () => void
  onConfirmar: (mesa: string, obs: string) => void
}

/** Resumo do cliente (nome, dia/horário, pessoas) – cabeçalho dos overlays. */
export function ResumoReserva({ reserva }: { reserva: ReservaPainel }) {
  return (
    <div className="painel-rsv__resumo">
      <span className="painel-rsv__resumo-nome">{reserva.cliente}</span>
      <span className="painel-rsv__resumo-meta">
        8 de maio de 2025 às {reserva.horario} h
      </span>
      <span className="painel-rsv__resumo-pax">
        {reserva.pessoas} {reserva.pessoas === 1 ? 'pessoa' : 'pessoas'}
      </span>
    </div>
  )
}

/** AceitarSentar – encaminha a reserva: escolhe mesa (e obs, ao sentar). */
export function AceitarSentar({
  open,
  reserva,
  aceitar,
  onClose,
  onConfirmar,
}: AceitarSentarProps) {
  const [mesa, setMesa] = useState('')
  const [obs, setObs] = useState('')
  const titulo = aceitar ? 'Aceitar reserva' : 'Sentar cliente'

  const confirmar = () => {
    if (!mesa) return
    onConfirmar(mesa, obs.trim())
  }

  return (
    <PainelOverlay open={open} onClose={onClose} title={titulo}>
      <div className="painel-rsv">
        <ResumoReserva reserva={reserva} />
        <div className="painel-rsv__fields">
          <CampoSelect
            id="painel-rsv-mesa"
            rotulo="Número da mesa"
            value={mesa}
            onChange={setMesa}
            opcoes={MESAS_DISPONIVEIS.map((m) => `Mesa ${m}`)}
            placeholder="Escolher mesa"
          />
          {!aceitar && (
            <CampoTexto
              id="painel-rsv-obs"
              rotulo="Observação"
              value={obs}
              onChange={setObs}
              rows={3}
              placeholder="Escrever observação"
            />
          )}
        </div>
        <RodapeAcao
          label={aceitar ? 'Aceitar reserva' : 'Sentar cliente'}
          disabled={!mesa}
          onConfirm={confirmar}
          onCancel={onClose}
        />
      </div>
    </PainelOverlay>
  )
}

/* ------------------- Cancelar reserva ------------------- */

interface CancelarProps {
  open: boolean
  reserva: ReservaPainel
  onClose: () => void
  onConfirmar: (motivo: string) => void
}

/** CancelarReserva – pede motivo antes de cancelar. */
export function CancelarReserva({ open, reserva, onClose, onConfirmar }: CancelarProps) {
  const [motivo, setMotivo] = useState('')
  const mesa = reserva.mesa ?? '—'

  const confirmar = () => {
    if (!motivo) return
    onConfirmar(motivo)
  }

  return (
    <PainelOverlay open={open} onClose={onClose} title="Cancelar reserva">
      <div className="painel-rsv">
        <p className="painel-rsv__pergunta">
          Você gostaria de cancelar a reserva da mesa {mesa} do cliente{' '}
          <strong>{reserva.cliente}</strong>?
        </p>
        <div className="painel-rsv__fields">
          <CampoSelect
            id="painel-rsv-motivo"
            rotulo="Motivo"
            value={motivo}
            onChange={setMotivo}
            opcoes={MOTIVOS_CANCELAMENTO}
            placeholder="Selecionar motivo"
          />
        </div>
        <RodapeAcao
          label="Cancelar reserva"
          disabled={!motivo}
          onConfirm={confirmar}
          onCancel={onClose}
        />
      </div>
    </PainelOverlay>
  )
}

/* ------------------- Notificar cliente ------------------- */

interface NotificarProps {
  open: boolean
  reserva: ReservaPainel
  onClose: () => void
  onConfirmar: (mensagem: string) => void
}

/** NotificarCliente – envia mensagem ao cliente (template editável). */
export function NotificarCliente({ open, reserva, onClose, onConfirmar }: NotificarProps) {
  const [mensagem, setMensagem] = useState(MENSAGENS_NOTIFICACAO[0])
  const titulo = 'Notificar cliente'

  return (
    <PainelOverlay open={open} onClose={onClose} title={titulo}>
      <div className="painel-rsv">
        <ResumoReserva reserva={reserva} />
        <div className="painel-rsv__fields">
          <CampoTexto
            id="painel-rsv-msg"
            rotulo="Mensagem"
            value={mensagem}
            onChange={setMensagem}
            rows={4}
          />
        </div>
        <RodapeAcao
          label="Enviar mensagem"
          disabled={!mensagem.trim()}
          onConfirm={() => onConfirmar(mensagem.trim())}
          onCancel={onClose}
        />
      </div>
    </PainelOverlay>
  )
}

/* ------------------- Sucesso (confirmação verde) ------------------- */

interface SucessoProps {
  titulo: string
  texto: string
  onConcluir: () => void
}

/** SucessoAcao – estado verde pós-confirmação (mat-alert-fuse-Soft-success). */
export function SucessoAcao({ titulo, texto, onConcluir }: SucessoProps) {
  return (
    <div className="painel-rsv__success">
      <span className="painel-rsv__success-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
          <path
            d="M4.5 12.6l4.6 4.6 10.4-10.8"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="painel-rsv__success-title">{titulo}</h2>
      <p className="painel-rsv__success-text">{texto}</p>
      <button
        type="button"
        className="painel-rsv__btn painel-rsv__btn--primary painel-rsv__btn--success"
        onClick={onConcluir}
      >
        Concluir
      </button>
    </div>
  )
}

/* ------------------- Adicionar tag ------------------- */

interface AdicionarTagProps {
  open: boolean
  reserva: ReservaPainel
  onClose: () => void
  onConfirmar: (tag: string) => void
}

/** AdicionarTagPainel – escolhe uma tag (chips) para o card. */
export function AdicionarTagPainel({ open, reserva, onClose, onConfirmar }: AdicionarTagProps) {
  const [tag, setTag] = useState('')

  return (
    <PainelOverlay open={open} onClose={onClose} title="Adicionar tag">
      <div className="painel-rsv">
        <p className="painel-rsv__pergunta">
          Adicionar uma tag à reserva de <strong>{reserva.cliente}</strong>?
        </p>
        <div className="painel-rsv__chips" role="group" aria-label="Tags">
          {TAGS_PAINEL.map((t) => {
            const ativa = tag === t
            return (
              <button
                key={t}
                type="button"
                aria-pressed={ativa}
                className={`painel-rsv__chip${ativa ? ' painel-rsv__chip--active' : ''}`}
                onClick={() => setTag(ativa ? '' : t)}
              >
                {t}
              </button>
            )
          })}
        </div>
        <RodapeAcao
          label="Adicionar tag"
          disabled={!tag}
          onConfirm={() => onConfirmar(tag)}
          onCancel={onClose}
        />
      </div>
    </PainelOverlay>
  )
}
