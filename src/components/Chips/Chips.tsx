import Icon, { type IconName } from '../Icon/Icon'
import './Chips.css'

export interface ChipsItem {
  /** Rótulo do chip. Omitido em chips só-ícone (ex.: o de filtros). */
  label?: string
  /** Ícone opcional – glifo da fonte da marca. */
  icon?: IconName
  /** Nome acessível quando não há label (chips só-ícone). */
  ariaLabel?: string
}

export interface ChipsProps {
  /** Chips da fileira, na ordem do design (Figma "Filtros", 2:8815). */
  items: ChipsItem[]
  /**
   * Chave(s) do(s) chip(s) selecionado(s). A chave de um chip de texto é o seu
   * `label`; a de um chip só-ícone é o `icon`. Aceita um array quando a fileira
   * permite mais de um ativo ao mesmo tempo (ex.: benefício + funil de filtros
   * aplicado); `undefined`/string vazia = nenhum ativo.
   */
  value?: string | string[]
  /**
   * Notifica o toque de um chip com a chave dele. A decisão de toggle/limpar é
   * de quem controla – o chip só-ícone "Filtros" também notifica (ex.: abrir a
   * bottom sheet de filtros, não apenas limpar).
   */
  onSelect?: (value: string) => void
}

/** Chave estável de um chip: `label` (texto) ou `icon`/índice (só-ícone). */
const chipKey = ({ label, icon }: ChipsItem, index: number): string =>
  label ?? icon ?? `chip-${index}`

/**
 * Chips – fileira de filtros em forma de pílula. Cada chip é um `<button>`
 * (caráter interativo do DS "Chips"): fundo branco, borda neutra, radius
 * pill e texto 14px Regular. Suporta chips somente-ícone (o primeiro, com o
 * funil de filtros) e chips de texto ("Reserva de mesa", "2 por 1", …).
 * Quando controlado (`value` + `onSelect`), o chip selecionado assume o estado
 * ativo (pílula escura preenchida, ver Chips.css) e expõe `aria-pressed`.
 */
export default function Chips({ items, value, onSelect }: ChipsProps) {
  return (
    <div className="chips">
      {items.map((item, index) => {
        const key = chipKey(item, index)
        const active = Array.isArray(value) ? value.includes(key) : key === value
        return (
          <button
            key={key}
            type="button"
            className={active ? 'chips__chip chips__chip--active' : 'chips__chip'}
            aria-label={item.ariaLabel ?? item.label}
            aria-pressed={onSelect ? active : undefined}
            onClick={onSelect ? () => onSelect(key) : undefined}
          >
            {item.icon && <Icon name={item.icon} size={16} />}
            {item.label && <span className="chips__label">{item.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
