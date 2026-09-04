import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Card, { type CardProps } from '../../components/Card/Card'
import Chips, { type ChipsItem } from '../../components/Chips/Chips'
import ContentSection from '../../components/ContentSection/ContentSection'
import FilterSheet, {
  EMPTY_FILTERS,
  hasSheetFilters,
  matchesSheetFilters,
  type FilterState,
} from '../../components/FilterSheet/FilterSheet'
import Icon from '../../components/Icon/Icon'
import type { TagsVariant } from '../../components/Tags/Tags'
import type { Merchant } from '../../data/merchants'
import { getCategoria, merchantsForCategory } from '../../data/categorias'
import './CategoriaPage.css'

/**
 * Chips de benefício da seção – espelho local do `FILTER_CHIPS` da home (App),
 * mesmo idioma de duplicação já usado por BuscarRestaurantesPage: a home fica
 * intocada e cada página que reapresenta os filtros carrega a própria cópia.
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

/** Benefício (chip de texto) → variantes de tag do card – espelho de `FILTER_TAGS` da home. */
const FILTER_TAGS: Record<string, TagsVariant[]> = {
  'Reserva de mesa': ['oferta-local', 'bobs-fa'],
  '2 por 1': ['leve2pague1', 'indica', 'bobs-fa'],
  Fidelidade: ['fidelidade'],
  Cortesia: ['cortesia'],
  Cashback: ['cashback'],
  'Desconto no local': ['cupom-r20'],
}

/** Uma loja virada em card do grid – espelho do `toCard` da home. */
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
 * CategoriaPage – página de uma categoria do rail da home (rota
 * `/categorias/:slug`), aberta ao tocar num item do MerchantRail.
 *
 * Reapresenta a seção ALTA da home (chips + grade de `Card` altos) filtrada pela
 * categoria tocada, SEM o título "Restaurantes pra comer fora" repetido: a barra
 * do topo já traz o nome da categoria (decisão: "Barra + só chips e grade"). O
 * `ContentSection` entra com `header={false}`.
 *
 * A base da grade é `merchantsForCategory(slug)` (reais da categoria + top-up
 * determinístico a 8 quando há menos, sem repetir os reais). Os chips funcionam
 * como na home (App): benefício single-select + funil "Filtros" abrindo a
 * `FilterSheet`, cruzando em AND sobre a base DA CATEGORIA (não o catálogo todo).
 *
 * Shell de página de cliente (sem BrandHeader): a `.categoria-page` espelha a
 * `.app` (coluna 834px centralizada), sem transform/filter/position, então o
 * `position: fixed` da `FilterSheet` (último filho) cobre a viewport inteira.
 * Slug desconhecido → volta pra home (robustez a deep-link).
 */
export default function CategoriaPage() {
  const { slug = '' } = useParams()
  const categoria = getCategoria(slug)

  // Base da página: reais + top-up determinístico (seed = slug), estável entre
  // renders/navegações. Slug desconhecido já cai no `Navigate` abaixo.
  const base = useMemo(() => merchantsForCategory(slug), [slug])

  // Filtro de benefício ativo (single-select). `undefined` = base completa.
  const [activeFilter, setActiveFilter] = useState<string>()
  // Critérios da bottom sheet "Filtros" já aplicados. `EMPTY_FILTERS` = nenhum.
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  // Bottom sheet de filtros aberta/fechada.
  const [sheetOpen, setSheetOpen] = useState(false)

  // Slug fora do registro → redireciona pra home (todas as hooks já rodaram).
  if (!categoria) return <Navigate to="/" replace />

  // Seleção de chip: o só-ícone "Filtros" abre a bottom sheet; os de benefício
  // togglam (tocar de novo limpa). Mesma regra da home.
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

  // Limpa benefício + sheet de uma vez (estado vazio "Limpar filtros"). A
  // categoria permanece – o clique limpa os filtros, não a página.
  const clearAll = () => {
    setActiveFilter(undefined)
    setFilters(EMPTY_FILTERS)
  }

  // Quanto o rascunho da sheet alcança JÁ combinado com o benefício ativo,
  // sobre a base da categoria – alimenta "Mostrar N restaurantes".
  const countFor = (draft: FilterState): number =>
    base.filter((merchant) => benefitsMatch(merchant) && matchesSheetFilters(merchant, draft))
      .length

  // Grid sob filtros (benefício ∩ sheet) sobre a base da categoria.
  const visible = base.filter(
    (merchant) => benefitsMatch(merchant) && matchesSheetFilters(merchant, filters),
  )

  // Estado vazio – mesmo padrão da home (ícone do funil + "Limpar filtros").
  const emptyState = visible.length === 0 && (
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
    <div className="categoria-page">
      {/* Barra do topo (decisão "Voltar + título"): seta pra home, nome da
          categoria centralizado. Sticky – o voltar segue visível ao rolar a
          grade; fundo opaco cobre os cards que passam por baixo. */}
      <header className="categoria-page__toolbar">
        <Link to="/" className="categoria-page__back" aria-label="Voltar">
          <Icon name="back" size={24} style="Line" />
        </Link>
        <h1 className="categoria-page__title">{categoria.label}</h1>
        {/* Espaçador simétrico ao botão de voltar – mantém o título no centro
            real da barra. */}
        <span className="categoria-page__toolbar-end" aria-hidden="true" />
      </header>

      <main className="categoria-page__main">
        {/* Sem `SectionHeader` (header={false}): os chips + a grade vêm direto
            sob a barra, com o título da categoria já no topo. O grid e o estado
            vazio reaproveitam os slots do ContentSection. */}
        <ContentSection
          header={false}
          filters={
            <Chips items={FILTER_CHIPS} value={chipValue} onSelect={handleFilterSelect} />
          }
          count={visible.length}
          renderCard={(index) => {
            const merchant = visible[index]
            return <Card key={merchant.slug} {...toCard(merchant)} />
          }}
          empty={emptyState}
        />
      </main>

      {/* Bottom sheet de "Filtros" – mesmo contrato da home (App). Último filho
          de `.categoria-page` (sem transform/filter/position) → `fixed` cobre a
          viewport. */}
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
    </div>
  )
}
