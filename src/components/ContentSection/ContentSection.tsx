import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import SectionHeader from '../SectionHeader/SectionHeader'
import StoreCard from '../StoreCard/StoreCard'
import './ContentSection.css'

export interface ContentSectionProps {
  /** Section title – see SectionHeader. */
  title?: string
  /**
   * Omit the header row (SectionHeader) entirely. Lets a page reuse the grid /
   * filters / empty-state slots without the title line – e.g. the category
   * pages, where the bar above already carries the title. Defaults to `true`
   * (header shown) so the existing call sites keep their behavior.
   */
  header?: boolean
  /** "See all" action label – see SectionHeader. */
  actionLabel?: string
  /** Green "open now" status dot before the title – see SectionHeader. */
  status?: boolean
  /**
   * Basis for the default card count (`rows * cardsPerRow`). In grid mode the
   * columns are responsive (CSS auto-fill) – this no longer fixes the column
   * count. Defaults to 4 (matches the wireframe).
   */
  cardsPerRow?: number
  /** Card height in px. Defaults to 200. */
  cardHeight?: number
  /** Number of card rows to render. Defaults to 1. */
  rows?: number
  /**
   * Render each grid slot with a custom card. Called once per slot
   * (index 0..cardsPerRow*rows-1) and must return a keyed element.
   * Falls back to StoreCard placeholders when omitted.
   */
  renderCard?: (index: number) => ReactNode
  /**
   * Optional filters row (chips) rendered between the header and the grid –
   * mirrors the Figma section frame that stacks header → filtros → cards.
   */
  filters?: ReactNode
  /**
   * Render the cards as a horizontal carousel rail instead of a grid. The rail
   * scrolls sideways (design 2:8581); cards keep their intrinsic fixed width.
   */
  carousel?: boolean
  /**
   * Total cards to render – defaults to `cardsPerRow * rows`. In carousel mode
   * this is the number of distinct cards; with `infinite` it becomes the size
   * of the repeating cycle that fills the viewport width.
   */
  count?: number
  /**
   * Carousel only: repeat the `count` cards until the rail fills the visible
   * width plus a scroll buffer – no fixed card limit. Cards visually clip only
   * at the container edge (the rail scrolls on, design 2:8581).
   */
  infinite?: boolean
  /** Card width in px in carousel mode. Defaults to 174 (design 2:8582). */
  cardWidth?: number
  /**
   * Estado vazio (grid com 0 cards) – conteúdo opcional exibido no lugar do
   * grid quando a combinação de filtros não encontra loja (ex.: funil de
   * filtros + benefício ativo juntos, sem resultado). Só renderiza quando há
   * `empty` e o total é 0; sem ele, mantém o comportamento atual (grid vazio).
   */
  empty?: ReactNode
}

/** Largura do gap entre cards do rail – espelha `--space-1-5` (12px). */
const CAROUSEL_GAP = 12
/** Cards extras além da largura visível para o rail sempre ter rolagem. */
const SCROLL_BUFFER = 4

/** Mede a largura visível do rail full-bleed (100vw) – a área da tela onde os
 * cards são cortados. No modo carrossel o ref fica no rail, não na seção. */
function useContentWidth() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return { ref, width }
}

/**
 * ContentSection – a reusable section: header row (title + "see all") followed
 * by a grid of store cards. Mirrors the wireframe's two store sections, which
 * differ only in card height and row count. Pass `renderCard` to swap the
 * placeholder cards for real ones, and set `carousel` to render the cards as
 * a horizontal scrolling rail instead of the grid. With `carousel` + `infinite`
 * the rail cycles the cards to fill the user's screen width (clipping only at
 * the container edge) instead of stopping at a fixed count.
 */
export default function ContentSection({
  title,
  header = true,
  actionLabel,
  status = false,
  cardsPerRow = 4,
  cardHeight = 200,
  rows = 1,
  renderCard,
  filters,
  carousel = false,
  count,
  infinite = false,
  cardWidth = 174,
  empty,
}: ContentSectionProps) {
  const distinct = count ?? cardsPerRow * rows
  const { ref, width } = useContentWidth()

  // Modo infinito: quantos cards cabem na largura visível (+ gap e buffer).
  let total = distinct
  if (carousel && infinite) {
    const visible = Math.max(width, cardWidth)
    const fits = Math.ceil(visible / (cardWidth + CAROUSEL_GAP))
    total = Math.max(distinct, fits + SCROLL_BUFFER)
  }

  const cards = renderCard
    ? Array.from({ length: total }, (_, index) => {
        // Infinito: o índice volta ao início do ciclo (0..count-1).
        const slot = carousel && infinite ? index % distinct : index
        // No rail o ContentSection garante a key única por slot; no grid o
        // renderCard é quem fornece a key (contrato existente).
        return carousel ? (
          <Fragment key={index}>{renderCard(slot)}</Fragment>
        ) : (
          renderCard(slot)
        )
      })
    : Array.from({ length: total }, (_, index) => (
        <StoreCard key={index} height={cardHeight} />
      ))

  return (
    <section className="content-section">
      {header !== false && (
        <SectionHeader title={title} actionLabel={actionLabel} status={status} />
      )}
      {filters && <div className="content-section__filters">{filters}</div>}
      {carousel ? (
        // O ref mede o rail full-bleed (100vw) para o cálculo infinito.
        <div ref={ref} className="content-section__carousel">{cards}</div>
      ) : total === 0 && empty ? (
        // Nenhuma loja atende à combinação de filtros – mostra o estado vazio
        // no lugar do grid (com um slot para ação "limpar filtros").
        <div className="content-section__empty">{empty}</div>
      ) : (
        // Colunas responsivas definidas no CSS (auto-fill + minmax) para o
        // grid não estourar a tela em viewports estreitas.
        <div className="content-section__grid">{cards}</div>
      )}
    </section>
  )
}
