import { useState } from 'react'
import PainelOverlay from './PainelOverlay'
import {
  FILTROS_VAZIOS,
  ORIGENS_PAINEL,
  TAGS_PAINEL,
  type FiltrosPainelState,
  type StatusPainel,
} from './painelModel'
import './FiltrosPainel.css'

/** Todos os status do painel (para renderizar os grupos de filtro). */
const TODOS_STATUS: StatusPainel[] = [
  'Nova',
  'Confirmada',
  'Aprovação',
  'No-show',
  'Cancelada',
  'Sentado',
]

function GrupoChips(props: {
  titulo: string
  opcoes: readonly string[]
  escolhidas: string[]
  onAlternar: (v: string) => void
}) {
  const { titulo, opcoes, escolhidas, onAlternar } = props
  return (
    <fieldset className="painel-filtro__grupo">
      <legend className="painel-filtro__titulo">{titulo}</legend>
      <div className="painel-filtro__chips">
        {opcoes.map((o) => {
          const ativa = escolhidas.includes(o)
          return (
            <button
              key={o}
              type="button"
              aria-pressed={ativa}
              className={`painel-filtro__chip${ativa ? ' painel-filtro__chip--active' : ''}`}
              onClick={() => onAlternar(o)}
            >
              {o}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

interface FiltrosPainelProps {
  open: boolean
  onClose: () => void
  aplicados: FiltrosPainelState
  onAplicar: (f: FiltrosPainelState) => void
  /** Conta quantos resultados o filtro alcança (para o rodapé "Mostrar N"). */
  count: (f: FiltrosPainelState) => number
}

/** FiltrosPainel – overlay de filtros do Painel Hostess (board 171:14543):
 * grupos status da reserva / origem / tags; "Limpar" e "Mostrar N reservas". */
export default function FiltrosPainel({ open, onClose, aplicados, onAplicar, count }: FiltrosPainelProps) {
  const [rascunho, setRascunho] = useState<FiltrosPainelState>(aplicados)

  const alternar = (chave: keyof FiltrosPainelState) => (valor: string) =>
    setRascunho((atual) => {
      const lista = atual[chave] as string[]
      const nova = lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
      return { ...atual, [chave]: nova }
    })

  const temFiltro =
    rascunho.status.length > 0 || rascunho.origens.length > 0 || rascunho.tags.length > 0
  const n = count(rascunho)

  return (
    <PainelOverlay open={open} onClose={onClose} title="Filtros">
      <div className="painel-filtro">
        <GrupoChips
          titulo="status da reserva"
          opcoes={TODOS_STATUS}
          escolhidas={rascunho.status}
          onAlternar={(v) => alternar('status')(v)}
        />
        <GrupoChips
          titulo="origem"
          opcoes={ORIGENS_PAINEL}
          escolhidas={rascunho.origens}
          onAlternar={(v) => alternar('origens')(v)}
        />
        <GrupoChips
          titulo="tags"
          opcoes={TAGS_PAINEL}
          escolhidas={rascunho.tags}
          onAlternar={(v) => alternar('tags')(v)}
        />
        <footer className="painel-filtro__foot">
          <button
            type="button"
            className="painel-filtro__btn"
            disabled={!temFiltro}
            onClick={() => {
              setRascunho(FILTROS_VAZIOS)
            }}
          >
            Limpar
          </button>
          <button
            type="button"
            className="painel-filtro__btn painel-filtro__btn--primary"
            disabled={n === 0}
            onClick={() => onAplicar(rascunho)}
          >
            Mostrar {n} {n === 1 ? 'reserva' : 'reservas'}
          </button>
        </footer>
      </div>
    </PainelOverlay>
  )
}
