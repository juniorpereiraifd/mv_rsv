import { useState } from 'react'
import BrandHeader from './components/BrandHeader/BrandHeader'
import BuscarSheet from './components/BuscarSheet/BuscarSheet'
import ContentSection from './components/ContentSection/ContentSection'
import MerchantRail from './components/MerchantRail/MerchantRail'
import Card, { CardProps } from './components/Card/Card'
import Chips, { ChipsItem } from './components/Chips/Chips'
import FilterSheet, {
  EMPTY_FILTERS,
  hasSheetFilters,
  matchesSheetFilters,
  type FilterState,
} from './components/FilterSheet/FilterSheet'
import Icon from './components/Icon/Icon'
import MiniAnnouncementCard from './components/MiniAnnouncementCard/MiniAnnouncementCard'
import type { TagsVariant } from './components/Tags/Tags'
import type { Merchant } from './data/merchants'
import { MERCHANTS_UI } from './data/merchants.ui'
import './App.css'

/**
 * Filter chips for the tall store section – mirror of the Figma "Filtros"
 * frame (node 2:8815): an icon-only "filters" chip followed by benefit chips.
 */
const FILTER_CHIPS: ChipsItem[] = [
  { icon: 'filter', ariaLabel: 'Filtros' },
  { label: 'Reserva de mesa' },
  { label: '2 por 1' },
  { label: 'Fidelidade' },
  { label: 'Cortesia' },
  { label: 'Cashback' },
  { label: 'Desconto no local' },
]

/**
 * Filtro de benefício (chip de texto) → variantes de tag do card que "se
 * enquadram" naquele benefício. Como cada loja tem 1 tag curada (`cardTags`),
 * o mapeamento é por tipo de tag (decisão de produto):
 *  - "Reserva de mesa": as Reservas (Get In) do catálogo, cujo benefício é
 *    resgatado ao reservar mesa (`oferta-local` "R$ 20 ao reservar" e
 *    `bobs-fa` "Leve 2, pague 1 ao reservar" – as 25 lojas Reservas);
 *  - "2 por 1": as variantes "pague 1", com ou sem reserva (`leve2pague1`,
 *    `indica` e `bobs-fa`);
 *  - "Fidelidade"/"Cortesia"/"Cashback": a variante homônima;
 *  - "Desconto no local": só o cupom resgatado no local (`cupom-r20`,
 *    "R$ 20 no local"). Ofertas "no delivery" ficam de fora.
 * Lojas sem `cardTags` não entram em nenhum filtro.
 */
const FILTER_TAGS: Record<string, TagsVariant[]> = {
  'Reserva de mesa': ['oferta-local', 'bobs-fa'],
  '2 por 1': ['leve2pague1', 'indica', 'bobs-fa'],
  Fidelidade: ['fidelidade'],
  Cortesia: ['cortesia'],
  Cashback: ['cashback'],
  'Desconto no local': ['cupom-r20'],
}

/** Distância em km (`'3,4 km'` → 3.4) para ordenar da mais perto à mais distante. */
const km = (distance: string): number => parseFloat(distance.replace(',', '.').replace(/\s?km/, ''))

/**
 * Cards do rail/carrossel "Próximos a você" (design node 2:8581) – UM card de
 * selo por loja, sem replicar cada loja em 3 selos. Entram as lojas em
 * destaque (`featured`): as 8 reais mais próximas do catálogo (todas com
 * página), cada uma com o seu próprio selo (`announceTag`), ordenadas da mais
 * perto para a mais distante. Foto e logo já são as mídias reais dos parceiros
 * (regeneradas do CSV em `merchants.ts`/`photos.ts`; `merchants.ui` é um
 * pass-through).
 */
const ANNOUNCEMENT_CARDS: Array<{
  slug: string
  name: string
  rating: string
  distance: string
  tag?: TagsVariant
  image: string
  logo: string
}> = MERCHANTS_UI.filter((m) => m.featured)
  .sort((a, b) => km(a.distance) - km(b.distance))
  .map((m) => ({
    slug: m.slug,
    name: m.name,
    rating: m.ratingValue ?? '4.9',
    distance: m.distance,
    tag: m.announceTag,
    image: m.image,
    logo: m.logo,
  }))

/**
 * Uma loja do catálogo virada em card do grid. O grid opera sobre o `Merchant`
 * (que carrega `category`, `priceTier`, `cardBadge`, `cardTags` – os campos que
 * os filtros leem) e só depois vira `CardProps` para render. Foto, logo, selo e
 * ofertas são os reais da loja (mídia do CSV via `merchants.ui` pass-through).
 */
const toCard = (merchant: Merchant): CardProps => ({
  title: merchant.name,
  category: merchant.category,
  ratingValue: merchant.ratingValue,
  ratingCount: merchant.ratingCount,
  ratingVariant: merchant.ratingVariant,
  period: merchant.period,
  distance: merchant.distance,
  tag: merchant.cardBadge,
  tags: merchant.cardTags,
  image: merchant.image,
  logo: merchant.logo,
  to: '/loja/' + merchant.slug,
})

/**
 * "Comer Fora" home screen – structure taken from the wireframe
 * (Figma: cMhyOvWvhsuRtOjTLvFvDH, frame 3:1655).
 *
 * Layout:
 *   1. Brand block (hero)
 *   2. Categorias rail
 *   3. Store section – short cards (carousel de anúncios)
 *   4. Store section – tall cards (grid completo do catálogo)
 *
 * The short (carousel) section carries the "Próximos a você" header with the
 * green status dot (Figma node 2:8573); the tall section keeps its
 * "Restaurantes pra comer fora" title and the filter chips row below it
 * (node 2:8815).
 */
export default function App() {
  // Filtro de benefício ativo (single-select). `undefined` = catálogo completo.
  const [activeFilter, setActiveFilter] = useState<string>()
  // Critérios da bottom sheet "Filtros" já aplicados (culinária ∪ preço ∪
  // destaques, em AND com o benefício). `EMPTY_FILTERS` = nenhum critério.
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  // Bottom sheet de filtros aberta/fechada (Figma 133:2758).
  const [sheetOpen, setSheetOpen] = useState(false)
  // Hub "Buscar em" (Figma 139:3692 "Proposta") – modal controlado pela home,
  // aberto pela pílula de busca do BrandHeader (`onOpenBuscar`). Decisão de
  // produto: o hub deixou de ser a rota `/buscar` (página branca) e virou este
  // overlay sobre o conteúdo VIVO da home, com blur por trás. `true` = aberto.
  const [buscarOpen, setBuscarOpen] = useState(false)

  // Seleção de chip: o só-ícone "Filtros" abre a bottom sheet (ação, não
  // toggle – quem limpa é o "Limpar tudo" da própria sheet); os chips de
  // benefício togglam (tocar de novo limpa). O funil fica "aceso" quando há
  // critério aplicado na sheet (ver `value` do Chips).
  const handleFilterSelect = (key: string) => {
    if (key === 'filter') {
      setSheetOpen(true)
      return
    }
    if (FILTER_TAGS[key]) {
      setActiveFilter((current) => (current === key ? undefined : key))
    }
  }

  // A loja atende ao benefício ativo? Sem benefício, todas passam.
  const benefitsMatch = (merchant: Merchant): boolean =>
    activeFilter == null ||
    (merchant.cardTags != null && FILTER_TAGS[activeFilter].includes(merchant.cardTags))

  // Limpa benefício + sheet de uma vez (estado vazio "Limpar filtros").
  const clearAll = () => {
    setActiveFilter(undefined)
    setFilters(EMPTY_FILTERS)
  }

  // Quanto o rascunho da sheet alcança JÁ combinado com o benefício ativo –
  // alimenta o rodapé "Mostrar N restaurantes" e o disable em 0 resultado.
  const countFor = (draft: FilterState): number =>
    MERCHANTS_UI.filter((m) => benefitsMatch(m) && matchesSheetFilters(m, draft)).length

  // Grid sob filtros (benefício ∩ sheet): só as lojas que atendem aos dois;
  // sem filtros, o catálogo inteiro na ordem de `merchants.ts`.
  const visibleMerchants = MERCHANTS_UI.filter(
    (m) => benefitsMatch(m) && matchesSheetFilters(m, filters),
  )
  const visibleCards = visibleMerchants.map(toCard)

  // Estado vazio – a combinação de filtros não acha loja (ex.: benefício que
  // encolhe o catálogo + critério da sheet que não cruza com ele).
  const emptyState = visibleMerchants.length === 0 && (
    <>
      <span className="content-section__empty-icon">
        <Icon name="filter" size={24} />
      </span>
      <p className="content-section__empty-title">Nenhum restaurante encontrado</p>
      <p className="content-section__empty-text">
        Tente limpar os filtros ou escolher outra combinação de benefícios.
      </p>
      <button type="button" className="content-section__empty-action" onClick={clearAll}>
        Limpar filtros
      </button>
    </>
  )

  // Chips ativos simultâneos: funil "aceso" quando a sheet tem critério +
  // (opcional) o benefício single-select.
  const chipValue = [
    ...(hasSheetFilters(filters) ? ['filter'] : []),
    ...(activeFilter ? [activeFilter] : []),
  ]

  return (
    <div className="app">
      {/* Cabeçalho de marca + toolbar. A pílula "Buscar em Cambuí, Campinas"
          abre o modal de busca da home (`onOpenBuscar`) – antes navegava para a
          rota `/buscar`, removida (ver BuscarSheet). */}
      <BrandHeader onOpenBuscar={() => setBuscarOpen(true)} />

      <main className="app__content">
        {/* Categorias – trilho circular de categorias (Figma 2:8356) */}
        <MerchantRail />

        {/* Anúncios – rail/carrossel infinito de cards compactos (design 2:8581).
            Header do design 2:8573: status dot "aberto agora" + título
            "Próximos a você". `infinite` repete o ciclo de cards até
            preencher a largura da tela, cortando apenas na borda do container. */}
        <ContentSection
          title="Próximos a você"
          status
          carousel
          infinite
          count={ANNOUNCEMENT_CARDS.length}
          renderCard={(index) => {
            const card = ANNOUNCEMENT_CARDS[index]
            return <MiniAnnouncementCard {...card} to={'/loja/' + card.slug} />
          }}
        />

        {/* Stores near you / explore – tall cards. Mantém o título original
            "Restaurantes pra comer fora" (node 2:8727) + filtros. A fileira
            combina benefício (single-select) com o funil de "Filtros", que abre
            a bottom sheet 133:2758; critérios das duas fontes cruzam em AND. */}
        <ContentSection
          title="Restaurantes pra comer fora"
          count={visibleCards.length}
          filters={
            <Chips items={FILTER_CHIPS} value={chipValue} onSelect={handleFilterSelect} />
          }
          renderCard={(index) => {
            const card = visibleCards[index]
            return <Card key={index} {...card} />
          }}
          empty={emptyState}
        />
      </main>

      {/* Bottom sheet de "Filtros" (Figma 133:2758) – rascunho próprio a cada
          abertura; "Mostrar N" grava e fecha, X/Escape/tocar fora descartam. */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        applied={filters}
        onApply={(next) => {
          setFilters(next)
          setSheetOpen(false)
        }}
        countFor={countFor}
      />

      {/* Overlay "Buscar em" (Figma 139:3692) – último filho de `.app`, mesmo
          padrão de "overlay no fim de .app" do FilterSheet: como `.app`/
          `.app__content` não têm transform/filter/position, o `position:fixed`
          do BuscarSheet cobre a viewport inteira (ignora o `max-width:834px`)
          e borra a home viva por trás. Aberto por `buscarOpen`; o X/Escape/
          toque fora chamam `onClose`, e as pílulas navegam (o App
          desmonta junto e o modal some). */}
      <BuscarSheet open={buscarOpen} onClose={() => setBuscarOpen(false)} />
    </div>
  )
}
