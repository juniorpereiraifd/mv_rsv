import type { Merchant } from './merchants'
import { MERCHANTS_UI } from './merchants.ui'
import { hasReservaOffer } from './reserva'

/**
 * Categorias do rail "Categorias" da home (Figma 2:8356) → páginas de categoria
 * (rota `/categorias/:slug`). Fonte única de slugs/labels do trilho E das páginas.
 *
 * O pertencimento deriva dos campos que já existem no `Merchant` (o CSV-fonte
 * não é versionado, então não há dado novo de ocasião):
 *   - "Reservas": oferta com `availability` "Reserva" (`hasReservaOffer`);
 *   - "Cafés": cozinha `Cafeteria`; "Saudável": cozinha `Saudável`;
 *   - "Ao ar livre": amenity "Área externa";
 *   - "Pra brindar"/"Espaço Kids"/"Romântico": não há campo de ocasião no
 *     catálogo → `matches` sempre falso → a página usa o sorteio de top-up.
 */
export interface Categoria {
  /** Segmento da rota `/categorias/:slug`. */
  slug: string
  /** Rótulo exibido no rail e no título da página da categoria. */
  label: string
  /** Predicado de pertencimento real (culinária/amenity/oferta). */
  matches: (merchant: Merchant) => boolean
}

export const CATEGORIAS: Categoria[] = [
  { slug: 'reservas', label: 'Reservas', matches: hasReservaOffer },
  { slug: 'pra-brindar', label: 'Pra brindar', matches: () => false },
  { slug: 'espaco-kids', label: 'Espaço Kids', matches: () => false },
  { slug: 'romantico', label: 'Romântico', matches: () => false },
  { slug: 'cafes', label: 'Cafés', matches: (m) => m.category === 'Cafeteria' },
  {
    slug: 'ao-ar-livre',
    label: 'Ao ar livre',
    matches: (m) => m.amenities.some((amenity) => amenity.label === 'Área externa'),
  },
  { slug: 'saudavel', label: 'Saudável', matches: (m) => m.category === 'Saudável' },
]

export const getCategoria = (slug: string): Categoria | undefined =>
  CATEGORIAS.find((categoria) => categoria.slug === slug)

/** Piso de cards por página de categoria (decisão: top-up pra 8). Categorias
 * com ≥ 8 reais mostram só os reais; com menos, completam até 8. */
export const MIN_CATEGORIA_CARDS = 8

/** Hash FNV-1a 32-bit – semente estável de uma string (o slug). */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** PRNG `mulberry32` – determinístico a partir de uma seed 32-bit. */
function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Lojas da página de uma categoria: os reais (ordem do catálogo) e, quando há
 * menos de `MIN_CATEGORIA_CARDS`, um top-up com sorteio determinístico do resto
 * da base (nunca repete os reais). Semeado pelo slug → estável entre renders e
 * navegações (não usa `Math.random`).
 */
export function merchantsForCategory(slug: string): Merchant[] {
  const categoria = getCategoria(slug)
  if (!categoria) return []
  const reais = MERCHANTS_UI.filter(categoria.matches)
  if (reais.length >= MIN_CATEGORIA_CARDS) return reais

  const slugReais = new Set(reais.map((m) => m.slug))
  const pool = MERCHANTS_UI.filter((m) => !slugReais.has(m.slug))
  const random = mulberry32(fnv1a(slug))
  const sorteado = [...pool]
  // Fisher–Yates com o PRNG da seed – embaralha a cópia, não o catálogo.
  for (let i = sorteado.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const tmp = sorteado[i]
    sorteado[i] = sorteado[j]
    sorteado[j] = tmp
  }
  return [...reais, ...sorteado.slice(0, MIN_CATEGORIA_CARDS - reais.length)]
}
