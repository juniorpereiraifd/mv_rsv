/**
 * reservaModel – tipos e dados-fonte do fluxo "Nova reserva" do app Reserva
 * (TagMe). Os clientes/contadores reproduzem os quadros do Figma
 * (cMhyOvWvhsuRtOjTLvFvDH, seção "Nova reserva"): busca devolve João Paulo,
 * João Victor e João Fonseca; o cartão de detalhes traz preferências, última
 * visita, aniversário, observação e os contadores (Passante/Reservas/Fila/
 * No-show/Cancelada). Sem backend – simulação fiel ao design.
 */

export interface ContadoresCliente {
  passante: number
  reservas: number
  fila: number
  noshow: number
  cancelada: number
}

export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  /** Inicial do avatar (o design usa "J" para todos os João). */
  inicial: string
  aniversario?: string
  ultimaVisita?: string
  observacao?: string
  preferencias?: string[]
  contadores?: ContadoresCliente
}

/** Clientes "existentes" da busca – mesmo conteúdo dos quadros do Figma. */
export const CLIENTES_INICIAIS: Cliente[] = [
  {
    id: 'joao-paulo',
    nome: 'João Paulo',
    email: 'joao.paulo@gmail.com',
    telefone: '+55 21 9954-2663',
    inicial: 'J',
  },
  {
    id: 'joao-victor',
    nome: 'João Victor',
    email: 'joao.victor@gmail.com',
    telefone: '+55 21 9954-3385',
    inicial: 'J',
  },
  {
    id: 'joao-fonseca',
    nome: 'João Fonseca',
    email: 'joao.fonseca@gmail.com',
    telefone: '+55 21 9921-3314',
    inicial: 'J',
    aniversario: '29/08',
    ultimaVisita: '19/02/2025',
    observacao:
      'Cliente é tenista profissional. Costuma pedir o Ribs on the Barbie e tomar coca-cola.',
    preferencias: ['Ribs on the Barbie', 'Coca-cola', 'Área externa', 'Mesa silenciosa'],
    contadores: { passante: 2, reservas: 4, fila: 6, noshow: 1, cancelada: 2 },
  },
]

/** Estados de reserva disponíveis no seletor (o default do design é "Nova"). */
export const STATUS_RESERVA = ['Nova', 'Confirmada', 'Aprovação', 'No-show', 'Cancelada'] as const
export type StatusReserva = (typeof STATUS_RESERVA)[number]

/** Origens do seletor de reserva (default do design: "Telefone"). */
export const ORIGENS_RESERVA = ['Telefone', 'Presencial', 'WhatsApp', 'App'] as const
export type OrigemReserva = (typeof ORIGENS_RESERVA)[number]

export interface Salao {
  nome: string
  lugares: number
  disponiveis: number
}

/** Salões do mapa (Salão principal, Varanda, Bar) com capacidade/livres. */
export const SALOES: Salao[] = [
  { nome: 'Salão principal', lugares: 46, disponiveis: 6 },
  { nome: 'Varanda', lugares: 34, disponiveis: 12 },
  { nome: 'Bar', lugares: 34, disponiveis: 12 },
]

/** Grades de horário sugeridas – 5 colunas por linha (12:00→14:00, …). */
export const HORARIOS: string[] = [
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
]

export interface ReservaDraft {
  clienteId: string | null
  pessoas: number
  /** Data escolhida em YYYY-MM-DD (chave do calendário). */
  data: string
  horario: string | null
  salao: string
  origem: OrigemReserva
  status: StatusReserva
  mesa?: string
  observacao?: string
}

/** Reserva nova em branco: hoje, 2 pessoas, Salão principal, status "Nova". */
export function reservaVazia(hoje = new Date()): ReservaDraft {
  const iso = hoje.toISOString().slice(0, 10)
  return {
    clienteId: null,
    pessoas: 2,
    data: iso,
    horario: null,
    salao: SALOES[0].nome,
    origem: 'Telefone',
    status: 'Nova',
  }
}

/** Encontra o cliente pelo id (helper usado pelas views). */
export function acharCliente(clientes: Cliente[], id: string | null): Cliente | undefined {
  return clientes.find((c) => c.id === id)
}

/** Busca textual simples por nome/e-mail/telefone – alimenta o dropdown. */
export function buscarClientes(clientes: Cliente[], termo: string): Cliente[] {
  const q = termo.trim().toLowerCase()
  if (!q) return []
  return clientes.filter((c) =>
    [c.nome, c.email, c.telefone].some((v) => v.toLowerCase().includes(q)),
  )
}

/** Formata a data ISO (YYYY-MM-DD) como "d MMM yyyy" em pt-BR para o resumo. */
export function formatarData(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
