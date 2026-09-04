import type { Merchant } from './merchants'

/**
 * Snapshot da reserva escolhida no widget "Reserva de Mesa" (`ReservaSection`).
 * Trafega entre as telas do fluxo de confirmação por `location.state` (nunca em
 * URL – a escolha não vaza pra query string nem pra histórico de navegação).
 *
 * Fonte da verdade da navegação: o estado vem do clique em "Reservar" e as
 * telas de revisão/sucesso só existem com ele (guard em cada página). Refresh
 * ou acesso direto perde o state → redireciona à loja.
 */
export interface ReservaSnapshot {
  /** Slug da loja – precisa casar com o `:slug` da rota (guard). */
  merchantSlug: string
  /** Índice da oferta de reserva em `merchant.offers` (para o voucher). */
  offerIndex: number
  /** Nº de convidados (1..12). */
  people: number
  /** Data LOCAL em 'yyyy-mm-dd' – nunca UTC, para o dia não deslocar ao trocar
   * de fuso entre criar a reserva e exibir. */
  dateISO: string
  /** Horário escolhido, ex. "19:00". */
  timeLabel: string
}

/** Nomes dos meses por extenso (capitalizados) para o rótulo da data. */
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/** Converte um `Date` em 'yyyy-mm-dd' LOCAL pelos componentes locais. A
 * formatação usa sempre `getFullYear/getMonth/getDate` (nunca `toISOString`,
 * que vira UTC e pode cair no dia anterior em fusos negativos). */
export function localDateISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** "2026-09-02" → "2 Setembro 2026" (dia sem zero à esquerda, mês por extenso).
 * Parse pelo texto (e não `new Date(dateISO)`, que interpreta em UTC) para o
 * rótulo nunca cair no dia errado. Entrada fora do formato retorna como veio. */
export function reservaDateLabel(dateISO: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO)
  if (!m) return dateISO
  const [, y, mm, dd] = m
  const monthIndex = Number(mm)
  if (monthIndex < 1 || monthIndex > 12) return dateISO
  return `${Number(dd)} ${MONTHS[monthIndex - 1]} ${y}`
}

/** Type guard do `location.state` das rotas de reserva – valida o shape e os
 * limites do snapshot (convidados 1..12, data no formato). */
export function isReservaSnapshot(value: unknown): value is ReservaSnapshot {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.merchantSlug === 'string' &&
    typeof s.offerIndex === 'number' &&
    Number.isInteger(s.offerIndex) &&
    s.offerIndex >= 0 &&
    typeof s.people === 'number' &&
    Number.isInteger(s.people) &&
    s.people >= 1 &&
    s.people <= 12 &&
    typeof s.dateISO === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.dateISO) &&
    typeof s.timeLabel === 'string'
  )
}

/** True quando a loja tem oferta de reserva (`availability` inclui "Reserva") –
 * a mesma checagem de `isReservaMerchant` do `RestaurantPage`, centralizada aqui
 * para os guards das páginas do fluxo. */
export function hasReservaOffer(merchant: Merchant): boolean {
  return merchant.offers.some((offer) => offer.availability.includes('Reserva'))
}
