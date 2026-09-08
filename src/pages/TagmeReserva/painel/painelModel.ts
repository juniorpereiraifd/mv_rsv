/**
 * painelModel – tipos e dados-fonte do "Painel - Hostess" (Figma 171-11753).
 * A aba Reserva lista reservas do dia (cards) que o hostess pode encaminhar:
 * aceitar (RSVP), sentar cliente, cancelar, notificar e adicionar tag. A seed
 * reproduz os cards do artboard "Aba (Reserva)" (171:14193): João Victor,
 * Felipe Dias, Bruna Diniz, Fernanda Torres, Ricardo Hirth e Selton Mello.
 * Sem backend – simulação fiel ao design.
 */

/** Estado da reserva no painel. */
export type StatusPainel =
  | 'Nova'
  | 'Confirmada'
  | 'Aprovação'
  | 'No-show'
  | 'Cancelada'
  | 'Sentado'

/** Tags de reserva que o hostess pode adicionar no card (chips). */
export const TAGS_PAINEL = ['Aniversário', 'Alergia', 'Programa Menu', 'Confraternização', 'VIP']

/** Motivos para cancelar (board "Cancelar reserva", 171:16333). */
export const MOTIVOS_CANCELAMENTO = [
  'Cliente desistiu',
  'Não atendeu',
  'Atraso',
  'Erro na reserva',
  'Outro',
]

/** Templates de mensagem para notificar o cliente (board "Notificar cliente"). */
export const MENSAGENS_NOTIFICACAO = [
  'Olá! Sua reserva foi confirmada. Até já! 🎉',
  'Sua mesa está pronta. Por gentileza, dirija-se à recepção.',
  'Infelizmente precisamos cancelar sua reserva. Pedimos desculpas.',
]

/** Mesas disponíveis para encaminhar (nº simples – o design usa 05, 17, 21, …). */
export const MESAS_DISPONIVEIS = ['05', '12', '13', '14', '17', '18', '21', '36']

export interface ReservaPainel {
  id: string
  cliente: string
  /** Chip "Reserva online" / RSVP etc. exibido no topo do card. */
  tag: string
  observacao?: string
  horario: string
  pessoas: number
  status: StatusPainel
  /** Mesa atribuída depois de aceitar/sentar. */
  mesa?: string
  /** Origem exibida nos filtros. */
  origem: string
  /** True quando o card é uma solicitação RSVP aguardando aprovação. */
  rsvp?: boolean
}

/** Reservas do dia – mesmos cards do artboard "Aba (Reserva)". */
export const RESERVAS_PAINEL: ReservaPainel[] = [
  {
    id: 'joao-victor',
    cliente: 'João Victor',
    tag: 'Reserva online',
    observacao: 'Vou com 40 pessoas comemorar um dia antes do meu casamento.',
    horario: '14:00',
    pessoas: 40,
    status: 'Nova',
    origem: 'Online',
    rsvp: true,
  },
  {
    id: 'felipe-dias',
    cliente: 'Felipe Dias',
    tag: 'Aniversário',
    observacao: 'Vou comemorar meu aniversário.',
    horario: '14:30',
    pessoas: 4,
    status: 'Nova',
    origem: 'Telefone',
  },
  {
    id: 'bruna-diniz',
    cliente: 'Bruna Diniz',
    tag: 'Reserva online',
    horario: '14:30',
    pessoas: 2,
    status: 'Confirmada',
    origem: 'Online',
  },
  {
    id: 'fernanda-torres',
    cliente: 'Fernanda Torres',
    tag: 'Reserva online',
    horario: '14:30',
    pessoas: 8,
    status: 'Confirmada',
    origem: 'Online',
  },
  {
    id: 'ricardo-hirth',
    cliente: 'Ricardo Hirth',
    tag: 'Aniversário',
    observacao: 'Vou comemorar meu aniversário.',
    horario: '15:00',
    pessoas: 2,
    status: 'Aprovação',
    origem: 'WhatsApp',
    rsvp: true,
  },
  {
    id: 'selton-mello',
    cliente: 'Selton Mello',
    tag: 'Reserva online',
    horario: '15:30',
    pessoas: 64,
    status: 'Nova',
    origem: 'Online',
  },
]

/** Origem exibida no filtro "origem". */
export const ORIGENS_PAINEL = ['Online', 'Telefone', 'WhatsApp', 'Presencial']

/* ----------------------- Filtros (painel de reservas) ----------------------- */

/** Critérios de filtro do painel de reservas (status/origem/tags). */
export interface FiltrosPainelState {
  status: StatusPainel[]
  origens: string[]
  tags: string[]
}

export const FILTROS_VAZIOS: FiltrosPainelState = { status: [], origens: [], tags: [] }

/** Filtra a lista: dentro de cada grupo é OR; entre grupos é AND. */
export function filtrarReservas(lista: ReservaPainel[], f: FiltrosPainelState): ReservaPainel[] {
  return lista.filter((r) => {
    if (f.status.length > 0 && !f.status.includes(r.status)) return false
    if (f.origens.length > 0 && !f.origens.includes(r.origem)) return false
    if (f.tags.length > 0 && !f.tags.includes(r.tag)) return false
    return true
  })
}
