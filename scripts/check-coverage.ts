/**
 * check-coverage – verifica a cobertura do catálogo do fake back-end.
 *
 * Garantias exigidas pelo projeto:
 *   - ≥50 lojas reais, com `id`/`slug` únicos;
 *   - foto de hero PRÓPRIA por loja (nenhuma loja divide hero com outra);
 *   - todas as lojas com image/logo/galeria(≥3) (os 140 assets são usados);
 *   - todos os `TagsVariant` (10) cobertos via `cardTags` ∪ `announceTag`;
 *   - todos os `BadgeVariant` (4) cobertos via `cardBadge`;
 *   - toda loja distribui ≥1 oferta + `clubOffer` (todo o conteúdo do app
 *     aparece em pelo menos uma loja) e as ofertas são válidas e sem título
 *     repetido entre lojas (conteúdo próprio por loja).
 *
 * Roda com `npm run check:coverage` (tsx). Sai com código ≠0 se falhar.
 */
import { MERCHANTS } from '../src/data/merchants'
import type { TagsVariant } from '../src/components/Tags/Tags'
import type { BadgeVariant } from '../src/components/Badge/Badge'

const ALL_TAGS: TagsVariant[] = [
  'cupom-r20',
  'oferta-local',
  'leve2pague1',
  'cortesia',
  'cashback',
  'indica',
  'o3o-clube',
  'o3o-merchant',
  'fidelidade',
  'bobs-fa',
]

const ALL_BADGES: BadgeVariant[] = ['popular', 'premium', 'exclusivo', 'gourmet']

const failures: string[] = []
let checks = 0

function check(ok: boolean, label: string): void {
  checks++
  if (!ok) failures.push(label)
  console.log(`${ok ? '  ✓' : '  ✗'} ${label}`)
}

function uniqueCount(items: string[]): number {
  return new Set(items).size
}

console.log(`Catálogo: ${MERCHANTS.length} lojas\n`)

// 1. Quantidade mínima de lojas reais.
check(MERCHANTS.length >= 50, `pelo menos 50 lojas (tem ${MERCHANTS.length})`)

// 2. `id` e `slug` únicos por loja (chaves do fake back-end / rotas).
check(uniqueCount(MERCHANTS.map((m) => m.id)) === MERCHANTS.length, `ids únicos (${MERCHANTS.length})`)
check(uniqueCount(MERCHANTS.map((m) => m.slug)) === MERCHANTS.length, `slugs únicos (${MERCHANTS.length})`)

// 3. Foto de hero própria: nenhuma loja divide a foto com outra.
const heroes = MERCHANTS.map((m) => m.image)
const dupHeroes = [...new Set(heroes.filter((h, i) => heroes.indexOf(h) !== i))]
check(dupHeroes.length === 0, `nenhuma loja compartilha foto de hero (${dupHeroes.length} duplicada${dupHeroes.length === 1 ? '' : 's'})`)
if (dupHeroes.length) console.log('    duplicadas:', dupHeroes)

// 4. Todas as lojas com image/logo/galeria(≥3).
const incompletas = MERCHANTS.filter((m) => !m.image || !m.logo || m.gallery.length < 3)
check(incompletas.length === 0, `todas as lojas com image/logo/galeria(≥3) (${incompletas.length} incompletas)`)
if (incompletas.length) console.log('    incompletas:', incompletas.map((m) => m.slug).join(', '))

// 5. Todos os TagsVariant cobertos (pills dos cards da home).
const coveredTags = new Set<TagsVariant>()
for (const m of MERCHANTS) {
  if (m.cardTags) coveredTags.add(m.cardTags)
  if (m.announceTag) coveredTags.add(m.announceTag)
}
const missingTags = ALL_TAGS.filter((t) => !coveredTags.has(t))
check(
  missingTags.length === 0,
  `TagsVariant cobertos (${coveredTags.size}/${ALL_TAGS.length}${missingTags.length ? `; faltam: ${missingTags.join(', ')}` : ''})`,
)

// 6. Todos os BadgeVariant cobertos (selos de overlay dos cards).
const coveredBadges = new Set<BadgeVariant>()
for (const m of MERCHANTS) {
  if (m.cardBadge) coveredBadges.add(m.cardBadge)
}
const missingBadges = ALL_BADGES.filter((b) => !coveredBadges.has(b))
check(
  missingBadges.length === 0,
  `BadgeVariant cobertos (${coveredBadges.size}/${ALL_BADGES.length}${missingBadges.length ? `; faltam: ${missingBadges.join(', ')}` : ''})`,
)

// 7. Destaques para o carrossel da home (derivado de `featured`).
const featured = MERCHANTS.filter((m) => m.featured)
check(featured.length >= 1, `lojas em destaque no carrossel (${featured.length})`)

// 8. Toda loja distribui ≥1 oferta (conteúdo do app aparece em ≥1 loja).
const semOferta = MERCHANTS.filter((m) => m.offers.length === 0)
check(semOferta.length === 0, `toda loja tem ≥1 oferta (${semOferta.length} sem oferta)`)

const totalOffers = MERCHANTS.reduce((acc, m) => acc + m.offers.length, 0)
check(totalOffers >= MERCHANTS.length, `ofertas distribuídas (${totalOffers} ofertas em ${MERCHANTS.length} lojas)`)

// 9. Toda loja tem `clubOffer` (bloco "Ganhe também").
const semClube = MERCHANTS.filter((m) => !m.clubOffer?.title)
check(semClube.length === 0, `toda loja tem clubOffer (${semClube.length} sem)`)

// 10. Ofertas estruturalmente válidas e com título único entre lojas.
const invalidas = MERCHANTS.flatMap((m) =>
  m.offers.filter((o) => !o.title || !o.subtitle || o.regras.length === 0),
)
check(invalidas.length === 0, `ofertas com título/subtítulo/regras (${invalidas.length} inválidas)`)

const offerTitles = MERCHANTS.flatMap((m) => m.offers.map((o) => o.title))
const dupTitles = [...new Set(offerTitles.filter((t, i) => offerTitles.indexOf(t) !== i))]
check(dupTitles.length === 0, `títulos de oferta únicos entre lojas (${dupTitles.length} duplicados)`)
if (dupTitles.length) console.log('    duplicados:', dupTitles.join(', '))

console.log('')
if (failures.length) {
  console.error(`FALHOU: ${failures.length} de ${checks} verificações.`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(`OK: ${checks} verificações passaram.`)
