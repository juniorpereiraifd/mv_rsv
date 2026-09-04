/**
 * `GET /api/checkins` e `POST /api/checkins` – check-ins persistidos na nuvem.
 *
 *  GET  → `[{ slug, at, count? }]`, mais recentes primeiro. Refletido na
 *        navegação (StickyFooter, BeneficioPage e pill de "Check-in realizado"
 *        na home).
 *  POST → corpo `{ slug }`. Upsert por loja: loja nova entra com `count: 1`;
 *        se a loja já tiver check-in, soma +1 no `count` (selos da cartela de
 *        fidelidade) e renova o instante `at` (ISO UTC). Registros antigos sem
 *        `count` valem 1.
 *
 * Persistência em Vercel KV (chave `checkins`) com fallback p/ Blob ou memória –
 * ver `store.ts`.
 */
import { readCheckins, writeCheckins, type Checkin } from './store'
import type { CheckinHandler, HttpRequest } from './http'

/** Ordena a lista por `at` decrescente (mais recente primeiro). */
function mostRecentFirst(list: Checkin[]): Checkin[] {
  return [...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

/** Lê o corpo JSON do POST e extrai o `slug` (valida que é string não vazia). */
async function readSlug(req: HttpRequest): Promise<string | undefined> {
  let body = ''
  for await (const chunk of req) body += chunk
  try {
    const parsed = JSON.parse(body || '{}')
    const slug = parsed?.slug
    return typeof slug === 'string' && slug.length > 0 ? slug : undefined
  } catch {
    return undefined
  }
}

export default (async (req, res) => {
  const { method } = req

  if (method === 'GET') {
    const list = mostRecentFirst(await readCheckins())
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    res.statusCode = 200
    res.end(JSON.stringify(list))
    return
  }

  if (method === 'POST') {
    const slug = await readSlug(req)
    if (!slug) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Corpo deve ser { "slug": "…" } com slug não vazio' }))
      return
    }

    const list = await readCheckins()
    const existing = list.find((item) => item.slug === slug)
    const now = new Date().toISOString()
    if (existing) {
      // Check-in adicional soma +1 selo (cartela de fidelidade); registros
      // antigos sem `count` contam como 1.
      existing.count = (existing.count ?? 1) + 1
      existing.at = now
    } else {
      list.push({ slug, at: now, count: 1 })
    }
    await writeCheckins(list)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    res.statusCode = 200
    res.end(JSON.stringify(mostRecentFirst(list)))
    return
  }

  res.statusCode = 405
  res.setHeader('Allow', 'GET, POST')
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: 'Método não permitido' }))
}) as CheckinHandler
