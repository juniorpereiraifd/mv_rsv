/**
 * Mídia real coletada (SPA-only) – mapa `slug → { image, logo?, gallery }`
 * com URLs resolvidas das fotos em `/restaurantes/<slug>/` (hero, logo e
 * galeria coletados da web na fase anterior).
 *
 * POR QUE `import.meta.glob` AQUI e não em `merchants.ts`/`photos.ts`: essas
 * camadas são importadas pela serverless `/api/merchants` (Vercel), que roda
 * fora do bundle do Vite – o macro de build quebraria o empacotamento da
 * função. Este módulo só é importado pela camada de UI (App e páginas), então
 * pode usar o macro do Vite sem conflito. Se uma pasta de restaurante ganhar
 * um arquivo novo, ele entra sozinho aqui – sem editar catálogo nem serverless.
 *
 * Hero é a foto principal (card/header), logo é a marca (avatar) e gallery são
 * as miniaturas da página individual, na ordem `gallery-1..N`.
 */
const FILES = import.meta.glob('../../restaurantes/*/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** Formato de mídia por loja – `logo` e galeria podem faltar (não coletadas). */
export interface RealMedia {
  image: string
  logo?: string
  gallery: string[]
}

/** `../../restaurantes/<slug>/<arquivo>` → `{ slug, arquivo }` */
const rel = /^\.\.\/\.\.\/restaurantes\/([^/]+)\/([^/]+)$/

const media = new Map<string, RealMedia>()

for (const [path, url] of Object.entries(FILES)) {
  const m = rel.exec(path)
  if (!m) continue
  const [, slug, file] = m
  if (slug.startsWith('_')) continue // `_results` e afins não são lojas
  const base = file.replace(/\.[a-z0-9]+$/i, '') // `hero.jpg` → `hero`
  let entry = media.get(slug)
  if (!entry) {
    entry = { image: '', gallery: [] }
    media.set(slug, entry)
  }
  if (base === 'hero') entry.image = url
  else if (base.startsWith('logo')) entry.logo = url
  else {
    const g = /^gallery-(\d+)$/.exec(base)
    if (g) entry.gallery[Number(g[1]) - 1] = url
  }
}

// Remove buracos de numeração (ex.: gallery-1 e gallery-3 sem a 2).
for (const [, entry] of media) entry.gallery = entry.gallery.filter(Boolean)

/** Mídia real por slug. Lojas sem pasta não aparecem aqui. */
export const REAL_MEDIA: Record<string, RealMedia> = Object.fromEntries(media)
