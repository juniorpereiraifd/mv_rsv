/**
 * Mensagens 1:1 restaurante ↔ cliente (fake door). Assim como o `SEED_HISTORY`
 * do Perfil, as conversas são mocks fixos no front-end que apontam para lojas
 * REAIS do catálogo (`slug`), então logo/nome e o link do chat/benefício
 * funcionam de verdade. Não há back-end de mensagens nem estado de leitura que
 * persista: `unread` é vitrine estática (espírito dos contadores 27/3 do Perfil).
 *
 * O merchant é resolvido em runtime via `getMerchantUI(slug)` – uma thread cujo
 * slug saia do catálogo é descartada na render (defensivo).
 */
export interface MessageThread {
  /** Slug de uma loja REAL do catálogo. */
  slug: string
  /** Rótulo relativo de tempo (ex. "1 h") – vitrine fixa, como o mock. */
  time: string
  /** true = conversa não lida: pinta o dot da lista e conta no badge do Perfil. */
  unread: boolean
}

/** Conversas iniciais – 7 lojas reais, as 6 primeiras não lidas (o badge do
 * Perfil mostra 6, casando com o frame). */
const THREAD_SEEDS: MessageThread[] = [
  { slug: 'deveras-pizza', time: '1 h', unread: true },
  { slug: 'trattoria-tavolino-higienopolis', time: '2 h', unread: true },
  { slug: 'badaue', time: '6 h', unread: true },
  { slug: 'america-paulista', time: '18 h', unread: true },
  { slug: 'boa-praca-paulista', time: '2 d', unread: true },
  { slug: 'pacifico-the-taco-shop', time: '6 d', unread: true },
  { slug: 'coco-bambu-jk-restaurante', time: '12 d', unread: false },
]

/** Lista fixa de conversas da caixa de entrada. */
export function listThreads(): MessageThread[] {
  return THREAD_SEEDS
}

/** Total de conversas não lidas – alimenta o badge numérico do entrypoint do
 * Perfil (6 no frame). Uma thread de loja fora do catálogo conta pela própria
 * seed (não resolve aqui; a resolução é só pra render). */
export function unreadCount(): number {
  return THREAD_SEEDS.filter((thread) => thread.unread).length
}
