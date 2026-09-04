import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  checkIn as checkInService,
  listCheckins,
  resetCheckins as resetCheckinsService,
  type Checkin,
} from '../services/checkins'

/**
 * Estado global dos check-ins (fake back-end persistido na nuvem).
 *
 * - Carrega os check-ins na montagem (skeleton enquanto `loading`).
 * - `checkIn(slug)` faz atualização OTIMISTA: pinta como feito na hora e reverte
 *   (rollback) se a chamada falhar – a UI nunca "espera" o servidor. Cada
 *   chamada acumula +1 no `count` do registro (selos da cartela de fidelidade);
 *   loja nova entra com `count: 1`.
 * - `checkedIn(slug)` é o seletor de presença usado pela navegação (StickyFooter,
 *   BeneficioPage, pill da home).
 * - `stampsOf(slug)` é o seletor de acúmulo (selos): retorna `count ?? 1` quando
 *   a loja tem check-in, senão 0. Só a BeneficioPage de loja fidelidade lê isso.
 * - `reset()` limpa tudo – só chamado pelo botão do /move (com confirmação).
 * - `error` guarda a última falha de rede para feedback discreto na UI.
 */
interface CheckinContextValue {
  /** Lista de check-ins, mais recentes primeiro. */
  checkins: Checkin[]
  /** true enquanto os check-ins estão sendo carregados do backend. */
  loading: boolean
  /** Mensagem da última falha de rede (ou null quando está tudo certo). */
  error: string | null
  /** true quando a loja `slug` já tem check-in feito. */
  checkedIn: (slug: string) => boolean
  /** Nº de selos acumulados (check-ins) da loja `slug` – 0 quando não tem. */
  stampsOf: (slug: string) => number
  /** Faz/acumula o check-in da loja. Resolve true em sucesso. */
  checkIn: (slug: string) => Promise<boolean>
  /** Apaga todos os check-ins. Resolve true em sucesso. */
  reset: () => Promise<boolean>
}

const CheckinContext = createContext<CheckinContextValue | undefined>(undefined)

/** Lê o valor dos check-ins mantendo a ordem estável (mais recente primeiro). */
function withLatestFirst(list: Checkin[]): Checkin[] {
  return [...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

export function CheckinProvider({ children }: { children: ReactNode }) {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carrega os check-ins salvos assim que o app monta.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const list = await listCheckins()
        if (active) {
          setCheckins(list)
          setError(null)
        }
      } catch {
        if (active) setError('Não foi possível carregar os check-ins.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const checkedIn = useCallback(
    (slug: string) => checkins.some((item) => item.slug === slug),
    [checkins],
  )

  /** Selos (check-ins acumulados) da loja: `count ?? 1` quando existe, senão 0. */
  const stampsOf = useCallback(
    (slug: string) => {
      const item = checkins.find((entry) => entry.slug === slug)
      return item ? (item.count ?? 1) : 0
    },
    [checkins],
  )

  const checkIn = useCallback(async (slug: string): Promise<boolean> => {
    // Snapshot para rollback em caso de falha.
    const previous = checkins
    // Otimista: soma +1 no registro da loja (cartela de fidelidade) ou insere a
    // loja com 1 selo; o servidor responde com a lista reconciliada.
    const now = new Date().toISOString()
    const current = checkins.find((item) => item.slug === slug)
    const stamped: Checkin = current
      ? { ...current, count: (current.count ?? 1) + 1, at: now }
      : { slug, at: now, count: 1 }
    const optimistic = withLatestFirst([
      ...checkins.filter((item) => item.slug !== slug),
      stamped,
    ])
    setCheckins(optimistic)
    setError(null)
    try {
      const serverList = await checkInService(slug)
      setCheckins(serverList)
      return true
    } catch {
      setCheckins(previous)
      setError('Não foi possível concluir o check-in. Tente novamente.')
      return false
    }
  }, [checkins])

  const reset = useCallback(async (): Promise<boolean> => {
    const previous = checkins
    setCheckins([])
    setError(null)
    try {
      await resetCheckinsService()
      return true
    } catch {
      setCheckins(previous)
      setError('Não foi possível redefinir os check-ins.')
      return false
    }
  }, [checkins])

  const value = useMemo<CheckinContextValue>(
    () => ({ checkins, loading, error, checkedIn, stampsOf, checkIn, reset }),
    [checkins, loading, error, checkedIn, stampsOf, checkIn, reset],
  )

  return <CheckinContext.Provider value={value}>{children}</CheckinContext.Provider>
}

/** Hook de acesso ao estado global de check-ins (lança fora do provider). */
export function useCheckins(): CheckinContextValue {
  const ctx = useContext(CheckinContext)
  if (!ctx) throw new Error('useCheckins deve ser usado dentro de <CheckinProvider>')
  return ctx
}
