import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const ROOT = '/Users/junior.pereira/move_B2C'
const seedPath = join(ROOT, 'scripts', 'seed_restaurantes.json')
const seedList = JSON.parse(readFileSync(seedPath, 'utf8'))

const out = []
const missing = []
const partial = []
const missingLogo = []

for (const s of seedList) {
  const resPath = join(ROOT, 'restaurantes', '_results', `${s.slug}.json`)
  let res = null
  if (existsSync(resPath)) {
    try { res = JSON.parse(readFileSync(resPath, 'utf8')) } catch (e) { partial.push({ slug: s.slug, motivo: `result json inválido: ${e.message}` }) }
  } else {
    missing.push({ slug: s.slug, motivo: 'sem _results/<slug>.json' })
  }

  const entry = {
    slug: s.slug,
    nome: s.nome,
    categoria: s.categoria,
    cuisine: s.cuisine,
    notaMedia: s.notaMedia,
    tempoEntregaEstimadoMin: s.tempoEntregaEstimadoMin,
    distanciaKm: s.distanciaKm,
    urlOrigem: res?.officialUrl ?? null,
  }
  if (s.michelin) entry.michelin = s.michelin
  if (s.notaSubstituicao) entry.notaSubstituicao = s.notaSubstituicao

  const fotos = {}
  const semHero = !(res?.hero?.file && existsSync(join(ROOT, res.hero.file)))
  if (semHero) partial.push({ slug: s.slug, motivo: 'sem hero válido' })
  else fotos.hero = { arquivo: res.hero.file, origem: res.hero.source }
  fotos.galeria = (res?.gallery ?? []).filter(g => existsSync(join(ROOT, g.file))).map(g => ({ arquivo: g.file, origem: g.source }))
  const temLogo = res?.logo?.file && existsSync(join(ROOT, res.logo.file))
  if (temLogo) fotos.logo = { arquivo: res.logo.file, origem: res.logo.source }
  else if (!semHero) missingLogo.push({ slug: s.slug }) // logo é opcional: casas tradicionais sem marca digital
  entry.fotos = fotos
  if (res?.notes) entry.notas = res.notes

  out.push(entry)
}

const finalPath = join(ROOT, 'restaurantes.json')
writeFileSync(finalPath, JSON.stringify(out, null, 2) + '\n')
console.log(`restaurantes.json escrito com ${out.length} entradas em ${finalPath}`)
console.log('=== pendências (sem result json) ===')
for (const m of missing) console.log(' ', m.slug, '→', m.motivo)
console.log('=== itens parciais (hero ausente) ===')
for (const p of partial) console.log(' ', p.slug, '→', p.motivo)
console.log('=== sem logo (opcional — casas tradicionais sem marca digital) ===')
if (missingLogo.length) for (const p of missingLogo) console.log(' ', p.slug)
else console.log('  (todos com logo)')

// sanity: unique slugs, categories count
const cats = {}
for (const o of out) cats[o.categoria] = (cats[o.categoria] ?? 0) + 1
console.log('=== distribuição por categoria ===')
for (const [c, n] of Object.entries(cats)) console.log(' ', c, '→', n)
