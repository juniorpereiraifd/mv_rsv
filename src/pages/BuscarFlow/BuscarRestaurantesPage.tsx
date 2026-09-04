import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card, { type CardProps } from '../../components/Card/Card'
import ContentSection from '../../components/ContentSection/ContentSection'
import Icon from '../../components/Icon/Icon'
import type { Merchant } from '../../data/merchants'
import { MERCHANTS_UI } from '../../data/merchants.ui'
import './BuscarFlow.css'
import './BuscarRestaurantesPage.css'

/**
 * Termos de exemplo do dropdown "Busca recentes" (Figma 139:5390) – constantes
 * do design. Tocar numa linha preenche a query e filtra a grade (fake door:
 * não há histórico real). Um termo real do catálogo vira uma busca com
 * resultado; os outros dois caem no estado vazio.
 */
const RECENT_SEARCHES = ['Mamma Jamma', 'Pizza', 'Lanche']

/**
 * Busca de restaurantes (Figma 139:5390/5548) – a rota `/buscar/restaurantes`.
 * Sem geolocalização/busca real: o campo filtra o catálogo da home.
 *
 * Estados:
 *  - query vazia (e campo autofocado): o dropdown "Busca recentes" do design
 *    5390 – nenhuma grade, porque o frame empilha o dropdown sobre a home;
 *  - query não vazia com match: título `Resultados de "…"` + grade 2 colunas
 *    de cards altos (padrão ContentSection/`Card` da home), frame 5548;
 *  - query sem match: estado vazio de ContentSection ("Nenhum resultado").
 *
 * O X de limpar aparece quando o campo tem texto e limpa a busca (volta aos
 * recentes). "Cancelar" volta à home `/` – o hub "Buscar em" virou overlay
 * montado pela home (App/BuscarSheet), não existe mais rota para ele. O match é
 * accent-insensitive (NFD + remoção de marcas) sobre nome, categoria e endereço
 * da loja.
 */
export default function BuscarRestaurantesPage() {
  const [query, setQuery] = useState('')
  const trimmed = query.trim()

  const results = useMemo(() => {
    if (!trimmed) return []
    const termo = normalizeSearch(trimmed)
    return MERCHANTS_UI.filter((merchant) =>
      [merchant.name, merchant.category, merchant.address].some((campo) =>
        normalizeSearch(campo).includes(termo),
      ),
    )
  }, [trimmed])

  return (
    <div className="buscar-page">
      <main className="buscar-page__main">
        <div className="buscar-page__inner">
          {/* Topo: campo de busca real (autofocado) + Cancelar. O campo é o
              mesmo do fluxo, mas na variante ativa (`<input>` + X de limpar). */}
          <div className="buscar-toolbar">
            <div className="buscar-field">
              <Icon className="buscar-field__icon" name="search" size={16} style="Line" />
              <input
                autoFocus
                type="text"
                className="buscar-field__input"
                placeholder="Buscar restaurantes"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query.length > 0 && (
                <button
                  type="button"
                  className="buscar-field__clear"
                  aria-label="Limpar busca"
                  onClick={() => setQuery('')}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <Link to="/" className="buscar-cancel">
              Cancelar
            </Link>
          </div>

          {trimmed === '' ? (
            /* Campo vazio (design 5390): dropdown "Busca recentes" com as
               linhas de exemplo. Tocar preenche a query e filtra. */
            <section className="buscar-recents" aria-label="Busca recentes">
              <h2 className="buscar-recents__title">Busca recentes</h2>
              <div className="buscar-recents__list">
                {RECENT_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="buscar-recents__row"
                    onClick={() => setQuery(term)}
                  >
                    <Icon className="buscar-recents__icon" name="chevron-down" size={20} style="Line" />
                    <span className="buscar-recents__term">{term}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            /* Query não vazia (design 5548): grade do catálogo filtrado, mesmo
               padrão da seção de lojas da home (ContentSection + Card). O
               `empty` só renderiza quando nenhuma loja casa com a busca. */
            <ContentSection
              title={`Resultados de "${trimmed}"`}
              count={results.length}
              renderCard={(index) => {
                const merchant = results[index]
                return <Card key={merchant.slug} {...toCard(merchant)} />
              }}
              empty={
                <div className="content-section__empty">
                  <span className="content-section__empty-icon">
                    <Icon name="search" size={20} style="Line" />
                  </span>
                  <h3 className="content-section__empty-title">
                    Nenhum restaurante encontrado
                  </h3>
                  <p className="content-section__empty-text">{`Nada por aqui para "${trimmed}". Tente outro nome ou culinária.`}</p>
                  <button
                    type="button"
                    className="content-section__empty-action"
                    onClick={() => setQuery('')}
                  >
                    Limpar busca
                  </button>
                </div>
              }
            />
          )}
        </div>
      </main>
    </div>
  )
}

/** Normalização accent-insensitive: minúsculas + NFD + remoção de marcas de
 * combinação (U+0300–U+036F). Aplica-se ao termo e aos campos do Merchant. */
function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/** Espelho local do `toCard` de App.tsx (não exportado lá): vira um `Merchant`
 * do catálogo em `CardProps` para a grade. Mídia e selos são os reais da loja. */
function toCard(merchant: Merchant): CardProps {
  return {
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
  }
}
