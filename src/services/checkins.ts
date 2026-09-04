/**
 * Cliente de check-ins do frontend.
 *
 * Resolução do endpoint:
 *  - `VITE_API_BASE` definida (ex. ambiente local apontando pro Vercel)
 *    → usa esse prefixo, ex. `https://meu-app.vercel.app/api`.
 *  - Produção (Vercel) → caminho relativo `/api` (mesma origem do bundle).
 *  - Desenvolvimento local sem backend → fallback em `localStorage`
 *    (chave `move_b2c_checkins`), para o app rodar com `npm run dev` sem
 *    credenciais. Documentado: nesse modo os dados ficam só no navegador.
 *
 * Todos os métodos têm try/catch e devolvem/`throw` de forma que o provider
 * possa aplicar atualização otimista com rollback em falha de rede.
 */

export interface Checkin {
  slug: string
  /** Instante ISO UTC do último check-in. */
  at: string
  /**
   * Nº de check-ins acumulados (selos da cartela de fidelidade). Opcional para
   * compatibilidade com registros antigos persistidos sem o campo: na leitura a
   * ausência vale 1 (a loja tem check-in feito). Só a tela do benefício de loja
   * fidelidade lê este campo; os demais consumidores seguem olhando presença.
   */
  count?: number
}

const LOCAL_KEY = 'move_b2c_checkins'

/** Base da API (sem a barra final): env customizada, senão relativa em prod. */
function apiBase(): string | undefined {
  const fromEnv = import.meta.env.VITE_API_BASE as string | undefined
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  // Em produção (Vercel) os `/api/*` são reescritos para as functions.
  return undefined
}

/** true quando estamos no modo fallback local (dev sem `VITE_API_BASE`). */
export function isLocalFallback(): boolean {
  return apiBase() === undefined && import.meta.env.DEV
}

function endpoint(path: string): string {
  const base = apiBase()
  return base ? `${base}${path}` : path
}

/* ------------------------- localStorage (fallback) ------------------------- */

function readLocal(): Checkin[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function writeLocal(list: Checkin[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  } catch {
    // Storage cheio/indisponível – ignora silenciosamente.
  }
}

/**
 * Registra (ou acumula) um check-in da loja na lista: loja nova entra com
 * `count: 1`; loja repetida soma +1 no `count` (selos da cartela de fidelidade)
 * e renova o instante `at`. Registros antigos sem `count` valem 1.
 */
function addStamp(list: Checkin[], slug: string): Checkin[] {
  const now = new Date().toISOString()
  const existing = list.find((item) => item.slug === slug)
  if (existing) {
    existing.count = (existing.count ?? 1) + 1
    existing.at = now
  } else {
    list.push({ slug, at: now, count: 1 })
  }
  return list
}

/** Ordena por `at` decrescente (mais recente primeiro). */
function mostRecentFirst(list: Checkin[]): Checkin[] {
  return [...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

/* ----------------------------- API remota ----------------------------- */

async function listRemote(): Promise<Checkin[]> {
  const res = await fetch(endpoint('/api/checkins'), { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Falha ao listar check-ins (${res.status})`)
  const data = (await res.json()) as unknown
  return Array.isArray(data) ? (data as Checkin[]) : []
}

async function checkInRemote(slug: string): Promise<Checkin[]> {
  const res = await fetch(endpoint('/api/checkins'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ slug }),
  })
  if (!res.ok) throw new Error(`Falha no check-in (${res.status})`)
  const data = (await res.json()) as unknown
  return Array.isArray(data) ? (data as Checkin[]) : []
}

async function resetRemote(): Promise<void> {
  const res = await fetch(endpoint('/api/checkins/reset'), {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Falha ao redefinir (${res.status})`)
}

/* ------------------------------- API pública ------------------------------ */

/** Lista os check-ins salvos, mais recentes primeiro. */
export async function listCheckins(): Promise<Checkin[]> {
  if (isLocalFallback()) return mostRecentFirst(readLocal())
  try {
    return mostRecentFirst(await listRemote())
  } catch (error) {
    // Em dev sem backend cai no fallback; em prod o erro sobe para o provider
    // exibir o estado de erro (e manter a UI utilizável).
    if (import.meta.env.DEV) return mostRecentFirst(readLocal())
    throw error
  }
}

/** Faz (ou acumula) o check-in de uma loja; retorna a lista atualizada. */
export async function checkIn(slug: string): Promise<Checkin[]> {
  if (isLocalFallback()) {
    const list = readLocal()
    addStamp(list, slug)
    writeLocal(list)
    return mostRecentFirst(list)
  }
  try {
    return mostRecentFirst(await checkInRemote(slug))
  } catch (error) {
    if (import.meta.env.DEV) {
      const list = readLocal()
      addStamp(list, slug)
      writeLocal(list)
      return mostRecentFirst(list)
    }
    throw error
  }
}

/** Apaga todos os check-ins (botão "Redefinir demonstração" do /move). */
export async function resetCheckins(): Promise<void> {
  if (isLocalFallback()) {
    writeLocal([])
    return
  }
  try {
    await resetRemote()
  } catch (error) {
    if (import.meta.env.DEV) {
      writeLocal([])
      return
    }
    throw error
  }
}
