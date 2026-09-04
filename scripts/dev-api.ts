/**
 * Servidor local de desenvolvimento para as rotas serverless de `/api`.
 *
 * A Vercel entrega um `req`/`res` Node de verdade para cada `api/*.ts`; este
 * script replica exatamente isso com `node:http`, para rodar front + API sem
 * precisar de credenciais (`vercel dev` sem login):
 *
 *   - Persistência cai no backend em memória de `api/store.ts` (nenhuma env
 *     `KV_REST_API_URL`/`BLOB_READ_WRITE_TOKEN` setada) – os check-ins somem
 *     quando o processo reinicia, igual ao `vercel dev` sem KV/Blob.
 *   - `/api/merchants` é carregado de forma preguiçosa (importa a fonte única
 *     de dados em `src/data/`); se algo nele quebrar, o resto da API continua de pé.
 *
 * Uso:
 *   npm run dev:api          # sobe em http://localhost:8787 (mude com PORT)
 *
 * Front apontando pra cá (sem proxy, sem CORS no navegador):
 *   VITE_API_BASE=http://localhost:8787 npm run dev
 */
import { createServer } from 'node:http'
import checkins from '../api/checkins'
import reset from '../api/reset'

const PORT = Number(process.env.PORT ?? 8787)

async function loadMerchants() {
  const mod = await import('../api/merchants')
  return mod.default
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const path = url.pathname.replace(/\/$/, '') || '/'

  // CORS: o Vite roda em outra porta (5173) e chama esta API cross-origin.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  // Ordem importa: `/api/checkins/reset` antes de `/api/checkins`.
  if (path === '/api/checkins/reset' && req.method === 'POST') return reset(req, res)
  if (path === '/api/checkins' && (req.method === 'GET' || req.method === 'POST')) {
    return checkins(req, res)
  }
  if (path === '/api/merchants' && req.method === 'GET') {
    try {
      const merchants = await loadMerchants()
      return merchants(req, res)
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Falha ao carregar /api/merchants', detail: String(error) }))
      return
    }
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: `Não encontrado: ${req.method} ${path}` }))
})

server.listen(PORT, () => {
  console.log(`[dev:api] http://localhost:${PORT}`)
  console.log('[dev:api] backend em memória – check-ins somem ao reiniciar o processo')
})
