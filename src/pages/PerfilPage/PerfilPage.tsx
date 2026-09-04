import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import Rating from '../../components/Rating/Rating'
import type { Merchant, Offer } from '../../data/merchants'
import { getMerchantUI, MERCHANTS_UI } from '../../data/merchants.ui'
import { localDateISO, reservaDateLabel } from '../../data/reserva'
import { useCheckins } from '../../context/CheckinProvider'
import { useReservas } from '../../context/ReservaProvider'
import type { Checkin } from '../../services/checkins'
import type { Reserva } from '../../services/reservas'
import './PerfilPage.css'

/**
 * PerfilPage – perfil do usuário (Figma 112:8338 "Perfil"). Rota `/perfil`,
 * acessada pelo botão de perfil do BrandHeader da home.
 *
 * Conteúdo HÍBRIDO: o TOPO é, em geral, vitrine fixa com a cópia do mock –
 * "Olá, Mariana" e os contadores 27/3 são números de exemplo que o app não
 * modela (não há nome de usuária nem contador de check-ins) e ficam iguais ao
 * frame. Desvio: um TERCEIRO contador "Reservas" (fora do frame 112:8355) foi
 * adicionado ao trio – vivo, contando os cartões do rail "Suas reservas"
 * (reservas confirmadas + a demo quando ainda não há nenhuma). As TRÊS seções
 * são alimentadas por dados:
 *   - "Suas reservas": CARROSSEL horizontal (rail) das reservas confirmadas no
 *     fluxo de reserva (`useReservas` – store local, persistido no navegador),
 *     resolvidas no catálogo; cada cartão mostra data/horário/convidados e o
 *     clique abre a tela de reserva confirmada (`/loja/:slug/reserva/sucesso`,
 *     reexibindo ticket + voucher do snapshot). Sem reservas confirmadas, o
 *     rail recebe UMA reserva demo (`SEED_RESERVAS` – loja real do catálogo com
 *     oferta de reserva, como o `SEED_HISTORY` da lista) e nunca abre vazio.
 *   - "Seus cupons": CARROSSEL horizontal (rail) do benefício ativo
 *     (`merchant.offers[0]`) de cada restaurante com check-in real – o cupom
 *     desbloqueado pelo check-in; o cartão navega para a página do benefício.
 *   - "Seus restaurantes": LISTA vertical (a única que permanece lista) –
 *     histórico de uma linha por loja; a loja entra na lista quando o usuário
 *     faz check-in (`useCheckins`) OU reserva de mesa (`useReservas`); as ações
 *     novas entram no TOPO e, no fim, ficam sempre os 3 mocks iniciais
 *     (`SEED_HISTORY` – hardcoded no front, nunca vindos do fake back-end), que
 *     só são "empurrados pra baixo" pelas lojas novas. Cada cartão mostra a
 *     nota e a categoria reais e navega pra loja.
 * Os três restaurantes do design não estão no catálogo, então nada da vitrine
 * do frame é usado nas seções (os assets em /private/tmp/figma_assets ficam
 * sem uso) – os mocks iniciais são lojas reais do catálogo pra foto, nota e o
 * link da loja funcionarem.
 *
 * Estados vazios: "Suas reservas" e "Seus restaurantes" nunca ficam vazios –
 * ambos começam com mocks iniciais (a reserva demo e os 3 restaurantes) e só
 * crescem pra cima. Só "Seus cupons" sem check-in mostra o heading e uma linha
 * de ajuda discreta no lugar do carrossel.
 *
 * Botão de voltar (toolbar claro do frame) volta para a home (`/`).
 *
 * Desvios documentados (convenções do app): barra de status iOS omitida e
 * botões de chat/badge da direita do toolbar omitidos (`opacity:0` no design);
 * cartões mostram os dados reais do catálogo no lugar dos estados mock de
 * progresso do frame ("N visitas", "Avalie sua visita") que o app não modela.
 */

/** Vitrine fixa do frame – os contadores "de exemplo" (112:8355). O terceiro
 * contador ("Reservas") é vivo e entra via `summaryCounters`, no corpo. */
const VITRINE_COUNTERS = [
  { value: '27', label: 'Check-ins' },
  { value: '3', label: 'Avaliações' },
] as const

/** Linha de ajuda quando não há cupons (lista dinâmica vazia). */
const EMPTY_COUPONS =
  'Nenhum cupom ainda — faça check-in num restaurante pra ativar seus benefícios.'
/** Linha de ajuda quando não há reservas (lista dinâmica vazia). */
const EMPTY_RESERVAS =
  'Você ainda não fez reservas — escolha um restaurante com reserva de mesa pra garantir seu lugar.'

/**
 * Mocks fixos do histórico "Seus restaurantes" – lojas reais do catálogo,
 * hardcoded no front-end (nunca carregadas do fake back-end), pra foto/logo,
 * nota/categoria e o link da loja funcionarem. Entram sempre no FIM da lista e
 * só são "empurrados pra baixo" pelas lojas novas – nunca somem. Se um slug
 * deixar o catálogo no futuro, completa com as primeiras lojas disponíveis pra
 * nunca faltar o estado inicial (a regra pede sempre ≥ 3 mocks).
 */
const SEED_HISTORY_SLUGS = [
  'deveras-pizza',
  'trattoria-tavolino-higienopolis',
  'badaue',
] as const

const SEED_HISTORY: Merchant[] = (() => {
  const seeds = SEED_HISTORY_SLUGS.map((slug) => getMerchantUI(slug)).filter(
    (merchant): merchant is Merchant => merchant !== undefined,
  )
  for (const merchant of MERCHANTS_UI) {
    if (seeds.length >= SEED_HISTORY_SLUGS.length) break
    if (!seeds.some((seed) => seed.slug === merchant.slug)) seeds.push(merchant)
  }
  return seeds
})()

/**
 * Mocks fixos de "Suas reservas" – reservas DEMO que garantem o rail nunca abrir
 * vazio, no mesmo espírito do `SEED_HISTORY` de "Seus restaurantes": quando o
 * usuário ainda não confirmou mesa no fluxo de reserva, o rail mostra ao menos
 * uma reserva em vez da linha de ajuda.
 *
 * São display-only (NUNCA gravadas no store `useReservas`), apontam pra lojas
 * REAIS do catálogo com oferta de reserva (`availability "Reserva"`), então
 * logo/foto e o link do benefício funcionam. O snapshot é o mesmo que o widget
 * montaria (a oferta de reserva da loja, a mesma gramática de data/horário/
 * convidados do subtítulo), mas a data rola daqui a 3 dias pra nunca envelhecer
 * numa demo. Uma loja que o usuário passa a reservar de verdade some daqui (a
 * reserva real entra no topo) – nunca o mesmo restaurante em dois cards.
 */
const SEED_RESERVAS_SLUGS = ['deveras-pizza'] as const

/** Índice da oferta de reserva da loja (mesma escolha do widget) – 0 se não achar. */
function reservaOfferIndex(merchant: Merchant): number {
  const index = merchant.offers.findIndex((offer) => offer.availability.includes('Reserva'))
  return index >= 0 ? index : 0
}

/** Monta a reserva demo: daqui a 3 dias às 19h, 2 pessoas (mesmos defaults do widget). */
function buildSeedReserva(slug: string): Reserva | undefined {
  const merchant = getMerchantUI(slug)
  if (!merchant) return undefined
  const date = new Date()
  date.setDate(date.getDate() + 3)
  return {
    id: `seed:${slug}`,
    at: date.toISOString(),
    merchantSlug: merchant.slug,
    offerIndex: reservaOfferIndex(merchant),
    people: 2,
    dateISO: localDateISO(date),
    timeLabel: '19:00',
  }
}

/** Reservas demo resolvidas no catálogo (slug fora do catálogo é descartado). */
const SEED_RESERVAS: Reserva[] = SEED_RESERVAS_SLUGS.map(buildSeedReserva).filter(
  (reserva): reserva is Reserva => reserva !== undefined,
)

/** "2" → "2 pessoas" / "1" → "1 pessoa" (mesma gramática do ticket de reserva). */
function peopleWord(n: number): string {
  return n === 1 ? '1 pessoa' : `${n} pessoas`
}

/** Resumo do card de reserva: "2 Setembro 2026 · 19:00 · 2 pessoas". */
function reservaSub(reserva: Reserva): string {
  return `${reservaDateLabel(reserva.dateISO)} · ${reserva.timeLabel} · ${peopleWord(reserva.people)}`
}

/** Uma visita ao restaurante (check-in ou reserva): a loja + instante da ação. */
interface LatestVisit {
  slug: string
  at: string
}

/**
 * Última atividade por loja entre check-ins e reservas – base do "mais recente
 * primeiro" do histórico. Cada loja entra UMA vez, com o instante da ação mais
 * nova: visitar de novo a mesma loja (novo check-in, ou reserva depois de
 * visitar) sobe ela no topo em vez de duplicar a linha.
 */
function latestVisits(checkins: Checkin[], reservas: Reserva[]): LatestVisit[] {
  const latest = new Map<string, string>()
  const bump = (slug: string, at: string): void => {
    const current = latest.get(slug)
    if (current === undefined || new Date(at).getTime() > new Date(current).getTime()) {
      latest.set(slug, at)
    }
  }
  for (const checkin of checkins) bump(checkin.slug, checkin.at)
  for (const reserva of reservas) bump(reserva.merchantSlug, reserva.at)
  return Array.from(latest, ([slug, at]) => ({ slug, at })).sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )
}

export default function PerfilPage() {
  const { checkins, loading } = useCheckins()
  const { reservas } = useReservas()

  // Cards do rail de reservas: as reservas confirmadas entram na ordem do store
  // (mais recente primeiro) e, atrás delas, entram as reservas demo
  // (`SEED_RESERVAS`) – o rail nunca fica vazio. Deduplicação por loja: se o
  // usuário passa a reservar de verdade uma loja que estava mockada, a reserva
  // demo daquela loja cai (a real entra no topo) – nunca o mesmo restaurante em
  // dois cards. Slug que não existe mais no catálogo é descartado (defensivo –
  // uma reserva antiga pode apontar pra loja fora do catálogo).
  const reservaCards = useMemo(() => {
    const out: Array<{ reserva: Reserva; merchant: Merchant }> = []
    const seeded = new Set<string>()
    for (const reserva of reservas) {
      const merchant = getMerchantUI(reserva.merchantSlug)
      if (!merchant) continue
      out.push({ reserva, merchant })
      seeded.add(merchant.slug)
    }
    for (const reserva of SEED_RESERVAS) {
      const merchant = getMerchantUI(reserva.merchantSlug)
      if (!merchant || seeded.has(merchant.slug)) continue
      seeded.add(merchant.slug)
      out.push({ reserva, merchant })
    }
    return out
  }, [reservas])

  // Contadores do topo: 27 (check-ins) e 3 (avaliações) seguem a cópia fixa do
  // frame; o terceiro ("Reservas") é VIVO e espelha os cartões do rail de
  // reservas acima (confirmadas + a demo quando ainda não há nenhuma), pra o
  // número nunca divergir do que a seção mostra logo abaixo.
  const summaryCounters = [
    ...VITRINE_COUNTERS,
    { value: String(reservaCards.length), label: 'Reservas' },
  ]

  // Restaurantes com check-in real (alimentam só "Seus cupons"), na ordem dos
  // check-ins (mais recente primeiro), resolvidos no catálogo. Slug que não
  // existe mais no catálogo é descartado (defensivo – o fake back-end pode ter
  // loja antiga). A seção "Seus restaurantes" usa `history` abaixo, que inclui
  // também reservas e os mocks iniciais.
  const visited = useMemo(() => {
    const out: Merchant[] = []
    for (const checkin of checkins) {
      const merchant = getMerchantUI(checkin.slug)
      if (merchant) out.push(merchant)
    }
    return out
  }, [checkins])

  // Cupons desbloqueados = benefício ativo (o primeiro da loja) de cada
  // restaurante visitado – mesmo card de benefício que o check-in ativa.
  const coupons = useMemo(
    () =>
      visited
        .map((merchant) => ({ merchant, offer: merchant.offers[0] }))
        .filter((entry): entry is { merchant: Merchant; offer: Offer } => entry.offer !== undefined),
    [visited],
  )

  // Histórico da seção "Seus restaurantes" – comportamento de unshift sobre a
  // lista: as lojas das ações mais recentes (check-in ou reserva) entram no
  // TOPO; os mocks iniciais (`SEED_HISTORY`) entram por último e ficam no fim,
  // empurrados pra baixo pelas lojas novas (nunca somem). Uma loja mockada que
  // ganha visita nova sobe pro topo sem linha duplicada.
  const history = useMemo(() => {
    const seen = new Set<string>()
    const ordered: Merchant[] = []
    const push = (slug: string): void => {
      const merchant = getMerchantUI(slug)
      if (!merchant || seen.has(merchant.slug)) return
      seen.add(merchant.slug)
      ordered.push(merchant)
    }
    for (const visit of latestVisits(checkins, reservas)) push(visit.slug)
    for (const merchant of SEED_HISTORY) push(merchant.slug)
    return ordered
  }, [checkins, reservas])

  return (
    <div className="perfil-page">
      <Link to="/" className="perfil-page__back" aria-label="Voltar">
        <Icon name="back" style="Line" size={24} />
      </Link>

      <main className="perfil-page__content">
        {/* Saudação (112:8351) – vitrine fixa */}
        <h1 className="perfil-page__greeting">Olá, Mariana</h1>

        {/* Contadores (112:8355) – vitrine fixa */}
        <div className="perfil-page__counters" aria-label="Resumo do seu perfil">
          {summaryCounters.map((counter) => (
            <div className="perfil-page__counter" key={counter.label}>
              <span className="perfil-page__counter-value">{counter.value}</span>
              <span className="perfil-page__counter-label">{counter.label}</span>
            </div>
          ))}
        </div>

        {/* "Suas reservas" – CARROSSEL (rail horizontal): reservas confirmadas
            no fluxo de reserva (store local `useReservas`). O clique no card
            reabre a tela de reserva confirmada (`/reserva/sucesso`, com o
            snapshot da reserva no state). Vem no topo das seções pra reserva
            recém-feita aparecer sem rolagem (o CTA "Ver minhas reservas" do
            sucesso chega aqui). No rail o card é um link inteiro (sem chevron)
            com largura fixa, deslizando com snap leve – mesmo idioma do
            carrossel "Próximos a você" da home. */}
        <section className="perfil-page__section" aria-label="Suas reservas">
          <h2 className="perfil-page__section-title">Suas reservas</h2>
          {reservaCards.length > 0 ? (
            <div className="perfil-page__rail">
              {reservaCards.map(({ reserva, merchant }) => (
                <Link
                  key={reserva.id}
                  className="perfil-card"
                  to={`/loja/${merchant.slug}/reserva/sucesso`}
                  state={reserva}
                >
                  <img className="perfil-card__logo" src={merchant.logo} alt="" />
                  <span className="perfil-card__body">
                    <span className="perfil-card__name">{merchant.name}</span>
                    <span className="perfil-card__sub">{reservaSub(reserva)}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="perfil-page__empty">{EMPTY_RESERVAS}</p>
          )}
        </section>

        {/* "Seus cupons" (112:8379) – CARROSSEL (rail horizontal): benefício de
            cada loja visitada, navegando para a página do benefício. */}
        <section className="perfil-page__section" aria-label="Seus cupons">
          <h2 className="perfil-page__section-title">Seus cupons</h2>
          {loading ? null : coupons.length > 0 ? (
            <div className="perfil-page__rail">
              {coupons.map(({ merchant, offer }) => (
                <Link
                  key={merchant.slug}
                  className="perfil-card"
                  to={`/loja/${merchant.slug}/beneficio/0`}
                >
                  <img className="perfil-card__logo" src={merchant.logo} alt="" />
                  <span className="perfil-card__body">
                    <span className="perfil-card__name">{merchant.name}</span>
                    <span className="perfil-card__sub">{offer.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="perfil-page__empty">{EMPTY_COUPONS}</p>
          )}
        </section>

        {/* "Seus restaurantes" (112:8410) – HISTÓRICO: uma linha por loja, em
            ordem de atividade (check-in ou reserva) da mais recente pra mais
            antiga; no fim ficam sempre os mocks iniciais. Nunca renderiza o
            estado vazio – começa com os mocks e só cresce pra cima. */}
        <section className="perfil-page__section" aria-label="Seus restaurantes">
          <h2 className="perfil-page__section-title">Seus restaurantes</h2>
          <div className="perfil-page__list">
            {history.map((merchant) => (
              <Link
                key={merchant.slug}
                className="perfil-card"
                to={`/loja/${merchant.slug}`}
              >
                <img className="perfil-card__logo" src={merchant.logo} alt="" />
                <span className="perfil-card__body">
                  <span className="perfil-card__name">{merchant.name}</span>
                  <span className="perfil-card__meta">
                    <Rating
                      variant={merchant.ratingVariant}
                      value={merchant.ratingValue}
                      count={merchant.ratingCount}
                    />
                    <span className="perfil-card__dot" aria-hidden="true">
                      •
                    </span>
                    <span className="perfil-card__category">{merchant.category}</span>
                  </span>
                </span>
                <Icon name="chevron-right" style="Line" size={24} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
