import type { ReservaSnapshot } from '../data/reserva'

/**
 * Cliente de reservas do frontend – persistência LOCAL (decisão do usuário).
 *
 * Ao contrário de `checkins.ts`, as reservas não têm fake back-end na nuvem:
 * ficam só no `localStorage` (chave `move_b2c_reservas`). É o suficiente pra
 * demo – a reserva confirmada sobrevive a reload e é apagada junto com os
 * check-ins no "Redefinir demonstração" do /move.
 *
 * Uma reserva persistida é um `ReservaSnapshot` (a escolha feita no widget)
 * + um `id` único (chave do card no perfil) e o instante `at` da confirmação
 * (ordena "mais recente primeiro", como os check-ins). Repetir a reserva na
 * mesma loja é permitido: cada confirmação gera um registro novo.
 */

/** Reserva "feita" – o snapshot confirmado no fluxo, persistido no perfil. */
export interface Reserva extends ReservaSnapshot {
  /** Id único da reserva (chave do card). */
  id: string
  /** Instante ISO UTC da confirmação – ordena "mais recente primeiro". */
  at: string
}

const LOCAL_KEY = 'move_b2c_reservas'

/** Ordena por `at` decrescente (mais recente primeiro). */
function mostRecentFirst(list: Reserva[]): Reserva[] {
  return [...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

function readLocal(): Reserva[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function writeLocal(list: Reserva[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  } catch {
    // Storage cheio/indisponível – ignora silenciosamente.
  }
}

/** Lista as reservas salvas, mais recentes primeiro. */
export function listReservas(): Reserva[] {
  return mostRecentFirst(readLocal())
}

/** Grava uma reserva confirmada; retorna a lista atualizada. */
export function addReserva(record: Reserva): Reserva[] {
  const list = readLocal()
  list.push(record)
  writeLocal(list)
  return mostRecentFirst(list)
}

/** Apaga todas as reservas (botão "Redefinir demonstração" do /move). */
export function resetReservas(): void {
  writeLocal([])
}
