/**
 * Camada de persistência dos check-ins (fake back-end).
 *
 * Estratégia de armazenamento (na ordem):
 *  1. Vercel KV        – quando `KV_REST_API_URL` estiver definida (produção).
 *  2. Vercel Blob      – fallback quando `BLOB_READ_WRITE_TOKEN` estiver definida
 *                       (usa um `checkins/db.json` privado).
 *  3. Memória          – último fallback para `vercel dev`/ambiente sem credenciais
 *                       (perde os dados ao reiniciar o processo – documentado).
 *
 * As libs são importadas dinamicamente (import lazy) para que carregar este
 * módulo nunca dispare efeitos de leitura de env; só a chamada em si consome as
 * credenciais. Nenhuma chave é lida ou commitada – fica só em `.env.local`.
 */

/**
 * Um check-in: `slug` da loja + instante ISO UTC do último check-in e o
 * acumulado `count` (selos da cartela de fidelidade). `count` é opcional para
 * registros antigos persistidos sem o campo – na leitura a ausência vale 1.
 */
export interface Checkin {
  slug: string
  at: string
  count?: number
}

type Backend = 'kv' | 'blob' | 'memory'

/** Escolhe o backend de acordo com as variáveis de ambiente disponíveis. */
function pickBackend(): Backend {
  if (process.env.KV_REST_API_URL) return 'kv'
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob'
  return 'memory'
}

const KV_KEY = 'checkins'
const BLOB_NAME = 'checkins/db.json'

/** Cache em memória – backend de última instância (dev sem credenciais). */
const memory = new Map<string, Checkin>()

/** Lê a lista de check-ins. Sempre retorna um array (vazio quando não há dados). */
export async function readCheckins(): Promise<Checkin[]> {
  const backend = pickBackend()

  if (backend === 'kv') {
    const { kv } = await import('@vercel/kv')
    const data = await kv.get<Checkin[]>(KV_KEY)
    return Array.isArray(data) ? data : []
  }

  if (backend === 'blob') {
    const { get } = await import('@vercel/blob')
    try {
      const result = await get(BLOB_NAME)
      const text = await result.blob.text()
      const data = JSON.parse(text)
      return Array.isArray(data) ? data : []
    } catch {
      // Arquivo ainda não existe → nenhum check-in gravado.
      return []
    }
  }

  return [...memory.values()]
}

/** Grava a lista de check-ins por inteiro (upsert idempotente feito na rota). */
export async function writeCheckins(list: Checkin[]): Promise<void> {
  const backend = pickBackend()

  if (backend === 'kv') {
    const { kv } = await import('@vercel/kv')
    await kv.set(KV_KEY, list)
    return
  }

  if (backend === 'blob') {
    const { put } = await import('@vercel/blob')
    await put(BLOB_NAME, JSON.stringify(list), { access: 'private' })
    return
  }

  memory.clear()
  for (const item of list) memory.set(item.slug, item)
}

/** Remove todos os check-ins (botão "Redefinir demonstração" do /move). */
export async function clearCheckins(): Promise<void> {
  const backend = pickBackend()

  if (backend === 'kv') {
    const { kv } = await import('@vercel/kv')
    await kv.del(KV_KEY)
    return
  }

  if (backend === 'blob') {
    const { del } = await import('@vercel/blob')
    try {
      await del(BLOB_NAME)
    } catch {
      // Arquivo inexistente – nada a apagar.
    }
    return
  }

  memory.clear()
}
