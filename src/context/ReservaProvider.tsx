import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ReservaSnapshot } from '../data/reserva'
import {
  addReserva as addReservaService,
  listReservas,
  resetReservas as resetReservasService,
  type Reserva,
} from '../services/reservas'

/**
 * Estado global das reservas confirmadas (persistido no localStorage).
 *
 * Espelha o `CheckinProvider`, mas SEM rede: as reservas não têm fake back-end
 * na nuvem (decisão do usuário) – ficam no navegador, então não há `loading`
 * nem `error`. Só as telas do perfil e do fluxo leem/escrevem isto.
 *
 * - Carrega as reservas na criação do estado (chave `move_b2c_reservas`).
 * - `recordReserva(snapshot)` grava a reserva confirmada: monta o registro
 *   (`id` único + `at` de confirmação) e persiste. Chamado no ponto único de
 *   confirmação do fluxo (`ReservaConfirmPage`) – dentro de um handler, nunca
 *   num effect (o StrictMode duplicaria a gravação em dev).
 * - `reset()` limpa tudo – só chamado pelo botão do /move (com confirmação),
 *   junto com o reset de check-ins.
 */
interface ReservaContextValue {
  /** Lista de reservas confirmadas, mais recentes primeiro. */
  reservas: Reserva[]
  /** Grava a reserva confirmada (id + instante) no store local. */
  recordReserva: (snapshot: ReservaSnapshot) => void
  /** Apaga todas as reservas. */
  reset: () => void
}

const ReservaContext = createContext<ReservaContextValue | undefined>(undefined)

/** Id único: UUID quando o navegador oferece, senão timestamp + aleatório. */
function newReservaId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function ReservaProvider({ children }: { children: ReactNode }) {
  // Store local síncrono – estado inicial já lê o que foi persistido.
  const [reservas, setReservas] = useState<Reserva[]>(() => listReservas())

  const recordReserva = useCallback((snapshot: ReservaSnapshot): void => {
    const record: Reserva = { ...snapshot, id: newReservaId(), at: new Date().toISOString() }
    setReservas(addReservaService(record))
  }, [])

  const reset = useCallback((): void => {
    resetReservasService()
    setReservas([])
  }, [])

  const value = useMemo<ReservaContextValue>(
    () => ({ reservas, recordReserva, reset }),
    [reservas, recordReserva, reset],
  )

  return <ReservaContext.Provider value={value}>{children}</ReservaContext.Provider>
}

/** Hook de acesso ao estado global de reservas (lança fora do provider). */
export function useReservas(): ReservaContextValue {
  const ctx = useContext(ReservaContext)
  if (!ctx) throw new Error('useReservas deve ser usado dentro de <ReservaProvider>')
  return ctx
}
