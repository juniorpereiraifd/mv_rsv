import { useState } from 'react'
import type { Merchant, PriceTier } from '../../data/merchants'
import { MERCHANTS_UI } from '../../data/merchants.ui'
import BottomSheet from '../BottomSheet/BottomSheet'
import Icon from '../Icon/Icon'
import './FilterSheet.css'

/**
 * Bottom sheet de "Filtros" (Figma 133:2758) – abre ao tocar no chip de funil
 * da home. Critérios do sheet (culinária ∪ preço ∪ destaques) combinam em AND
 * com o chip de benefício ativo da fileira (quem faz essa interseção é o App,
 * via `countFor`). Dados não exatos por simulação – mas culinárias, faixas de
 * preço e destaques vêm do catálogo real (`MERCHANTS_UI`), então todo critério
 * retorna lojas de verdade.
 */

/** Culinárias reais, da mais frequente à menos frequente (ordem de descoberta
 * preservada nos empates). É a lista exibida no grupo "Culinária". */
const CUISINES: string[] = (() => {
  const frequencia = new Map<string, number>()
  for (const m of MERCHANTS_UI) {
    frequencia.set(m.category, (frequencia.get(m.category) ?? 0) + 1)
  }
  return [...frequencia.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([culinaria]) => culinaria)
})()

/** Quantas culinárias aparecem antes do "Ver mais" (a partir da mais comum). */
const CUISINE_LIMIT = 6

/** Faixas de preço presentes no catálogo, da mais barata à mais cara. Como o
 * design simula, mostramos só faixas reais (a mais cara e a do meio). */
const PRICE_TIERS: PriceTier[] = (() => {
  const presentes = new Set<PriceTier>(MERCHANTS_UI.map((m) => m.priceTier))
  return (['$', '$$', '$$$'] as PriceTier[]).filter((faixa) => presentes.has(faixa))
})()

/** Colunas de "$" de cada tile de preço – o design reserva 5 posições iguais:
 * as do nível escolhido em escuro e as restantes "fantasma" (#ebebeb). */
const PRICE_SLOTS = 5

/** Destaques de curadoria exibidos no grupo "Destaques" – cada um mapeia para
 * um selo real do card (`cardBadge`): `premium` (Premiados) e `gourmet`. */
export type Destaque = 'premiados' | 'gourmet'

interface DestaqueOption {
  key: Destaque
  title: string
  subtitle: string
  /** Ícone da linha: estrela (Premiados) ou o selo Gourmet (asset). */
  icon: 'star' | 'gourmet'
}

const DESTAQUES: DestaqueOption[] = [
  {
    key: 'premiados',
    title: 'Premiados',
    subtitle: 'Restaurantes em destaque na curadoria',
    icon: 'star',
  },
  {
    key: 'gourmet',
    title: 'Gourmet',
    subtitle: 'Uma seleção especial para comer fora',
    icon: 'gourmet',
  },
]

/** Estado dos critérios da bottom sheet de "Filtros". Dentro de cada faceta a
 * seleção é união (OR – várias culinárias, vários destaques); entre facetas e
 * com o benefício da home é interseção (AND). `price` é faixa única. */
export interface FilterState {
  /** Culinárias marcadas (vêm do catálogo real). */
  cuisines: string[]
  /** Faixa de preço escolhida (ex.: "$$"). `undefined` = qualquer faixa. */
  price?: PriceTier
  /** Destaques marcados (premiados/gourmet). */
  destaques: Destaque[]
}

/** Sem nenhum critério – catálogo completo (dado o benefício ativo da home). */
export const EMPTY_FILTERS: FilterState = { cuisines: [], destaques: [] }

/** True quando há ao menos um critério aplicado (acende o funil da home). */
export const hasSheetFilters = (state: FilterState): boolean =>
  state.cuisines.length > 0 || state.price != null || state.destaques.length > 0

/**
 * A loja atende ao filtro da sheet? Facetas em AND; dentro da faceta
 * "Destaques", OR (uma loja é premiada OU gourmet). Não considera o chip de
 * benefício da home – combinar os dois é responsabilidade do App.
 */
export function matchesSheetFilters(merchant: Merchant, state: FilterState): boolean {
  if (state.cuisines.length > 0 && !state.cuisines.includes(merchant.category)) return false
  if (state.price && merchant.priceTier !== state.price) return false
  const querPremiados = state.destaques.includes('premiados')
  const querGourmet = state.destaques.includes('gourmet')
  if (querPremiados || querGourmet) {
    const ehPremiado = merchant.cardBadge === 'premium'
    const ehGourmet = merchant.cardBadge === 'gourmet'
    if (!((querPremiados && ehPremiado) || (querGourmet && ehGourmet))) return false
  }
  return true
}

export interface FilterSheetProps {
  open: boolean
  onClose: () => void
  /** Critérios atualmente aplicados na grade – semente do draft a cada abertura
   * (a sheet descarta o rascunho se fechar sem "Mostrar"). */
  applied: FilterState
  /** Aplica o rascunho escolhido (grava + fecha a sheet). */
  onApply: (filters: FilterState) => void
  /** Conta quantos restaurantes o rascunho alcança JÁ combinado com o benefício
   * ativo da home – alimenta o rodapé "Mostrar N restaurantes". */
  countFor: (draft: FilterState) => number
}

interface FilterSheetBodyProps {
  applied: FilterState
  onClose: () => void
  onApply: (filters: FilterState) => void
  countFor: (draft: FilterState) => number
}

/**
 * FilterSheet – monta o drawer com o conteúdo de "Filtros". O corpo é um
 * componente separado renderizado como filho do BottomSheet: como o sheet
 * desmonta os filhos quando fecha (retorna `null`), o rascunho reseta sozinho
 * a cada abertura a partir de `applied` – fechar sem aplicar descarta.
 */
export default function FilterSheet({ open, onClose, applied, onApply, countFor }: FilterSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      label="Filtros"
      panelClassName="bottom-sheet--filters"
      showHandle={false}
    >
      <FilterSheetBody applied={applied} onClose={onClose} onApply={onApply} countFor={countFor} />
    </BottomSheet>
  )
}

function FilterSheetBody({ applied, onClose, onApply, countFor }: FilterSheetBodyProps) {
  // Rascunho do sheet – só vira "aplicado" quando o usuário toca em "Mostrar".
  const [draft, setDraft] = useState<FilterState>(applied)
  // Grupos expandidos/colapsados (todos abertos por padrão – a sheet remonta o
  // corpo a cada abertura, então o estado volta ao inicial).
  const [aberto, setAberto] = useState({ culinaria: true, preco: true, destaques: true })
  // "Ver mais" de culinária. Se algum critério aplicado cai além do limite, já
  // abre expandido para a seleção não ficar invisível.
  const [todasCulinarias, setTodasCulinarias] = useState(
    () => applied.cuisines.some((c) => CUISINES.indexOf(c) >= CUISINE_LIMIT),
  )

  const alternarCulinaria = (culinaria: string) =>
    setDraft((atual) => ({
      ...atual,
      cuisines: atual.cuisines.includes(culinaria)
        ? atual.cuisines.filter((c) => c !== culinaria)
        : [...atual.cuisines, culinaria],
    }))

  const escolherPreco = (faixa: PriceTier) =>
    setDraft((atual) => ({ ...atual, price: atual.price === faixa ? undefined : faixa }))

  const alternarDestaque = (destaque: Destaque) =>
    setDraft((atual) => ({
      ...atual,
      destaques: atual.destaques.includes(destaque)
        ? atual.destaques.filter((d) => d !== destaque)
        : [...atual.destaques, destaque],
    }))

  const limparTudo = () => setDraft(EMPTY_FILTERS)

  const count = countFor(draft)
  const podeLimpar = hasSheetFilters(draft)
  const culinariasVisiveis = todasCulinarias ? CUISINES : CUISINES.slice(0, CUISINE_LIMIT)
  const temMaisCulinarias = CUISINES.length > CUISINE_LIMIT

  const chevron = (expandido: boolean) =>
    `filter-sheet__group-chevron${expandido ? ' filter-sheet__group-chevron--up' : ''}`

  return (
    <div className="filter-sheet">
      <header className="filter-sheet__header">
        <h2 className="filter-sheet__title">Filtros</h2>
        <button
          type="button"
          className="filter-sheet__close"
          aria-label="Fechar filtros"
          onClick={onClose}
        >
          <Icon name="close" size={20} />
        </button>
      </header>

      {/* Culinária – chips das categorias reais do catálogo (união) */}
      <section className="filter-sheet__group">
        <button
          type="button"
          className="filter-sheet__group-header"
          aria-expanded={aberto.culinaria}
          onClick={() => setAberto((a) => ({ ...a, culinaria: !a.culinaria }))}
        >
          <span className="filter-sheet__group-title">Culinária</span>
          <Icon name="chevron-down" style="Line" size={24} className={chevron(aberto.culinaria)} />
        </button>
        {aberto.culinaria && (
          <>
            <div className="filter-sheet__chip-row">
              {culinariasVisiveis.map((culinaria) => {
                const ativa = draft.cuisines.includes(culinaria)
                return (
                  <button
                    key={culinaria}
                    type="button"
                    aria-pressed={ativa}
                    className={`filter-sheet__chip${ativa ? ' filter-sheet__chip--active' : ''}`}
                    onClick={() => alternarCulinaria(culinaria)}
                  >
                    {culinaria}
                  </button>
                )
              })}
            </div>
            {temMaisCulinarias && (
              <button
                type="button"
                className="filter-sheet__see-more"
                onClick={() => setTodasCulinarias((v) => !v)}
              >
                {todasCulinarias ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </>
        )}
      </section>

      <hr className="filter-sheet__divider" />

      {/* Faixa de preço – faixas reais do catálogo, seleção única */}
      <section className="filter-sheet__group">
        <button
          type="button"
          className="filter-sheet__group-header"
          aria-expanded={aberto.preco}
          onClick={() => setAberto((a) => ({ ...a, preco: !a.preco }))}
        >
          <span className="filter-sheet__group-title">Faixa de preço</span>
          <Icon name="chevron-down" style="Line" size={24} className={chevron(aberto.preco)} />
        </button>
        {aberto.preco && (
          <div className="filter-sheet__chip-row filter-sheet__chip-row--price">
            {PRICE_TIERS.map((faixa) => {
              const ativa = draft.price === faixa
              return (
                <button
                  key={faixa}
                  type="button"
                  aria-pressed={ativa}
                  aria-label={`Faixa de preço ${faixa}`}
                  className={`filter-sheet__chip filter-sheet__chip--price${ativa ? ' filter-sheet__chip--active' : ''}`}
                  onClick={() => escolherPreco(faixa)}
                >
                  {Array.from({ length: PRICE_SLOTS }, (_, i) => (
                    <span
                      key={i}
                      className={i < faixa.length ? 'filter-sheet__price-filled' : 'filter-sheet__price-ghost'}
                    >
                      $
                    </span>
                  ))}
                </button>
              )
            })}
          </div>
        )}
      </section>

      <hr className="filter-sheet__divider" />

      {/* Destaques – curadoria premiados/gourmet (união) */}
      <section className="filter-sheet__group">
        <button
          type="button"
          className="filter-sheet__group-header"
          aria-expanded={aberto.destaques}
          onClick={() => setAberto((a) => ({ ...a, destaques: !a.destaques }))}
        >
          <span className="filter-sheet__group-title">Destaques</span>
          <Icon name="chevron-down" style="Line" size={24} className={chevron(aberto.destaques)} />
        </button>
        {aberto.destaques && (
          <div className="filter-sheet__option-group">
            {DESTAQUES.map((destaque) => {
              const ativo = draft.destaques.includes(destaque.key)
              return (
                <button
                  key={destaque.key}
                  type="button"
                  aria-pressed={ativo}
                  className={`filter-sheet__option-row${ativo ? ' filter-sheet__option-row--active' : ''}`}
                  onClick={() => alternarDestaque(destaque.key)}
                >
                  <span className="filter-sheet__option-icon">
                    <Icon name={destaque.icon} size={24} />
                  </span>
                  <span className="filter-sheet__option-text">
                    <span className="filter-sheet__option-title">{destaque.title}</span>
                    <span className="filter-sheet__option-subtitle">{destaque.subtitle}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <footer className="filter-sheet__actions">
        <button
          type="button"
          className="filter-sheet__action filter-sheet__action--clear"
          disabled={!podeLimpar}
          onClick={limparTudo}
        >
          Limpar tudo
        </button>
        <button
          type="button"
          className="filter-sheet__action filter-sheet__action--apply"
          disabled={count === 0}
          onClick={() => onApply(draft)}
        >
          Mostrar {count} {count === 1 ? 'restaurante' : 'restaurantes'}
        </button>
      </footer>
    </div>
  )
}
