import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import { LockIcon } from './novaReserva/icons'
import NovaReservaDrawer, {
  type ReservaConfirmada,
} from './novaReserva/NovaReservaDrawer'
import {
  AceitarSentar,
  AdicionarTagPainel,
  CancelarReserva,
  NotificarCliente,
} from './painel/actions/ReservaActions'
import FiltrosPainel from './painel/FiltrosPainel'
import { ReservaLista, type AcaoCard } from './painel/ReservaLista'
import {
  FILTROS_VAZIOS,
  filtrarReservas,
  RESERVAS_PAINEL,
  type FiltrosPainelState,
  type ReservaPainel,
} from './painel/painelModel'
import './TagmeReservaPage.css'

/** Aba ativa do painel (Hostess): Reserva (lista) ou Salão (ocupação). */
type AbaPainel = 'reserva' | 'salao'

/** Overlay de ação aberto + reserva alvo. */
type AcaoAberta = { acao: AcaoCard; reserva: ReservaPainel } | null

/** Mensagem de sucesso exibida após confirmar uma ação. */
interface SucessoInfo {
  titulo: string
  texto: string
}

/**
 * TagmeReservaPage – Painel do app "Reserva" do portal TagMe (print "image (64)").
 *
 * Tela cheia (rota `/tagme/reservas`). Reproduz o layout do "Painel - Hostess"
 * do Figma (171-11753) sobre a estrutura já existente: sidebar do portal,
 * barra superior, toolbar da loja, filtros e o corpo com a lista de Reservas
 * (aba ativa) + painel lateral de ocupação. A lista é dirigida por dados
 * (`RESERVAS_PAINEL`) e cada card oferece as ações do hostess — aceitar/RSVP,
 * sentar cliente, cancelar, notificar e adicionar tag — em overlays; os filtros
 * e o seletor de dia filtram a lista, e o estado vazio avisa quando não há
 * reservas no dia.
 */
export default function TagmeReservaPage() {
  const [aba, setAba] = useState<AbaPainel>('reserva')
  const [abrirReserva, setAbrirReserva] = useState(false)
  const [novasReservas, setNovasReservas] = useState<ReservaConfirmada[]>([])
  const [reservas, setReservas] = useState<ReservaPainel[]>(RESERVAS_PAINEL)
  const [filtros, setFiltros] = useState<FiltrosPainelState>(FILTROS_VAZIOS)
  const [abrirFiltros, setAbrirFiltros] = useState(false)
  const [acaoAberta, setAcaoAberta] = useState<AcaoAberta>(null)
  const [sucesso, setSucesso] = useState<SucessoInfo | null>(null)

  // Dia em exibição (só o rótulo; a seed é de 8 mai. 2025; dia alternativo vazio).
  const [diaHoje] = useState('8 de maio de 2025')
  const [diaAlternativo, setDiaAlternativo] = useState<string | null>(null)
  const diaAtual = diaAlternativo ?? diaHoje
  const ehHoje = diaAlternativo === null

  const filtradas = useMemo(
    () => filtrarReservas([...reservas, ...novasHostess(novasReservas)], filtros),
    [reservas, filtros, novasReservas],
  )
  // Num dia "alternativo" a lista fica vazia (estado "Quando não tiver reserva").
  const diaVazio = diaAlternativo !== null

  const atualizarReserva = (id: string, patch: Partial<ReservaPainel>) =>
    setReservas((lista) => lista.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const confirmarAcao = (acao: NonNullable<AcaoAberta>['acao'], reserva: ReservaPainel) => {
    // Encaminhamento de sucesso acontece no próprio overlay (antes de fechar),
    // então aqui só tratamos os que mudam o card sem overlay de confirmação.
    if (acao === 'rejeitar') {
      atualizarReserva(reserva.id, { status: 'Cancelada' })
      setSucesso({ titulo: 'Reserva rejeitada', texto: `A reserva de ${reserva.cliente} foi rejeitada.` })
    }
  }

  const fecharSucesso = () => setSucesso(null)

  return (
    <div className="tagme-reserva">
      {/* Sidebar escura do portal */}
      <aside className="tagme-reserva__sidebar">
        <Link to="/tagme" className="tagme-reserva__logo" aria-label="Voltar para a tela de acesso do TagMe">
          tagme
        </Link>

        <nav className="tagme-reserva__nav">
          {/* Grupo ativo – Painel */}
          <span className="tagme-reserva__nav-item tagme-reserva__nav-item--active">
            <Icon name="home" style="Line" size={18} />
            Painel
          </span>
          {/* Demais itens – sem tela no fluxo feliz; cadeado à direita indica
              que estão bloqueados (o print mostra o menu completo). */}
          <span className="tagme-reserva__nav-item" title="Bloqueado">
            <Icon name="calendar" style="Line" size={18} />
            Reservas
            <LockIcon className="tagme-reserva__nav-lock" size={14} />
          </span>
          <span className="tagme-reserva__nav-item" title="Bloqueado">
            <Icon name="clock" style="Line" size={18} />
            Passantes
            <LockIcon className="tagme-reserva__nav-lock" size={14} />
          </span>
          <span className="tagme-reserva__nav-item" title="Bloqueado">
            <Icon name="route" style="Line" size={18} />
            Comunicações
            <LockIcon className="tagme-reserva__nav-lock" size={14} />
          </span>
        </nav>
      </aside>

      {/* Área principal */}
      <div className="tagme-reserva__main">
        {/* Barra de voltar (sempre visível, no topo) */}
        <div className="tagme-reserva__topbar">
          <Link to="/tagme" className="tagme-reserva__back">
            <Icon name="back" style="Line" size={20} />
            <span>Voltar</span>
          </Link>
          <span className="tagme-reserva__crumb">Reservas / Painel</span>
        </div>

        {/* Toolbar da loja + ações */}
        <div className="tagme-reserva__toolbar">
          <div className="tagme-reserva__store">
            <span className="tagme-reserva__store-name">Coco Bambu Águas Claras</span>
            <span className="tagme-reserva__store-meta">Salão Principal · 798 lugares</span>
          </div>

          <div className="tagme-reserva__actions">
            <button
              type="button"
              className="tagme-reserva__btn tagme-reserva__btn--primary"
              onClick={() => setAbrirReserva(true)}
            >
              + Nova reserva
            </button>
          </div>
        </div>

        {/* Abas do painel: Reserva × Salão */}
        <div className="tagme-reserva__tabs" role="tablist" aria-label="Visão do painel">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'reserva'}
            className={`tagme-reserva__tab${aba === 'reserva' ? ' tagme-reserva__tab--active' : ''}`}
            onClick={() => setAba('reserva')}
          >
            Reserva
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'salao'}
            className={`tagme-reserva__tab${aba === 'salao' ? ' tagme-reserva__tab--active' : ''}`}
            onClick={() => setAba('salao')}
          >
            Salão
          </button>
        </div>

        {/* Seletor de dia + Filtros (aba Reserva) */}
        {aba === 'reserva' && (
          <div className="tagme-reserva__filters">
            <div className="tagme-reserva__daypicker">
              <button
                type="button"
                className="tagme-reserva__day-nav"
                aria-label="Dia anterior"
                onClick={() => setDiaAlternativo(ehHoje ? '7 de maio de 2025' : null)}
              >
                <Icon name="back" style="Line" size={14} />
              </button>
              <span className="tagme-reserva__day-label">{diaAtual}</span>
              <button
                type="button"
                className="tagme-reserva__day-nav"
                aria-label="Próximo dia"
                onClick={() => setDiaAlternativo(ehHoje ? '9 de maio de 2025' : null)}
              >
                <span className="tagme-reserva__day-next">
                  <Icon name="back" style="Line" size={14} />
                </span>
              </button>
              {!ehHoje && (
                <button type="button" className="tagme-reserva__link" onClick={() => setDiaAlternativo(null)}>
                  Voltar para hoje
                </button>
              )}
            </div>

            <button
              type="button"
              className="tagme-reserva__filter tagme-reserva__filter--filtros"
              onClick={() => setAbrirFiltros(true)}
            >
              <Icon name="filter" size={16} />
              Filtros
            </button>
          </div>
        )}

        {/* Corpo: lista de reservas (aba Reserva) OU ocupação (aba Salão) */}
        {aba === 'reserva' ? (
          <div className="tagme-reserva__body tagme-reserva__body--reserva">
            <section className="tagme-reserva__reservas">
              <h2 className="tagme-reserva__section-title">Reservas</h2>
              <ReservaLista
                reservas={diaVazio ? [] : filtradas}
                onAcao={(reserva, acao) => {
                  if (acao === 'rejeitar') {
                    confirmarAcao(acao, reserva)
                    return
                  }
                  setAcaoAberta({ acao, reserva })
                }}
              />
            </section>

            {/* Painel lateral de ocupação */}
            <aside className="tagme-reserva__panel">
              <h3 className="tagme-reserva__panel-title">Salão Principal</h3>
              <p className="tagme-reserva__panel-occupancy">
                <strong>87</strong> | 885 lugares · <strong>798</strong> livres
              </p>
              <p className="tagme-reserva__panel-note">
                Este salão não tem mesas numeradas — configure numerações no admin para exibir o mapa de mesas.
              </p>
            </aside>
          </div>
        ) : (
          <div className="tagme-reserva__body tagme-reserva__body--salao">
            <section className="tagme-reserva__saloon">
              <h2 className="tagme-reserva__section-title">Salão principal</h2>
              <p className="tagme-reserva__saloon-sub">6 / 46 lugares · 20 / 518 reservas</p>
              <aside className="tagme-reserva__panel">
                <h3 className="tagme-reserva__panel-title">Ocupação do salão</h3>
                <p className="tagme-reserva__panel-occupancy">
                  <strong>87</strong> | 885 lugares · <strong>798</strong> livres
                </p>
                <p className="tagme-reserva__panel-note">
                  Este salão não tem mesas numeradas — configure numerações no admin para exibir o mapa de mesas.
                </p>
              </aside>
            </section>
          </div>
        )}
      </div>

      {/* Drawer "Nova reserva" – fluxo completo */}
      <NovaReservaDrawer
        open={abrirReserva}
        onClose={() => setAbrirReserva(false)}
        onConfirmada={(reserva) =>
          setNovasReservas((atual) => [reserva, ...atual])
        }
      />

      {/* Overlays de ação do Painel Hostess */}
      {acaoAberta && (
        <AcaoHostessOverlays
          acao={acaoAberta.acao}
          reserva={acaoAberta.reserva}
          onClose={() => setAcaoAberta(null)}
          onSucesso={(s) => {
            setAcaoAberta(null)
            setSucesso(s)
          }}
          onPatchReserva={(patch) => atualizarReserva(acaoAberta.reserva.id, patch)}
        />
      )}

      {/* Filtros */}
      <FiltrosPainel
        open={abrirFiltros}
        onClose={() => setAbrirFiltros(false)}
        aplicados={filtros}
        onAplicar={(f) => {
          setFiltros(f)
          setAbrirFiltros(false)
        }}
        count={(f) => filtrarReservas(reservas, f).length}
      />

      {/* Sucesso (banner/overlay verde) */}
      {sucesso && (
        <div className="tagme-reserva__toast" role="status">
          <span className="tagme-reserva__toast-mark" aria-hidden="true">✓</span>
          <div>
            <strong>{sucesso.titulo}</strong>
            <p>{sucesso.texto}</p>
          </div>
          <button type="button" aria-label="Fechar" onClick={fecharSucesso}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/** Converte reservas criadas pelo drawer "+ Nova reserva" no modelo do painel. */
function novasHostess(novas: ReservaConfirmada[]): ReservaPainel[] {
  return novas.map((r) => ({
    id: `nova-${r.clienteId}-${r.data}-${r.horario}`,
    cliente: r.clienteNome,
    tag: 'Nova reserva',
    horario: r.horario ?? '12:00',
    pessoas: r.pessoas,
    status: 'Nova' as const,
    origem: r.origem,
  }))
}

/** Overlays de ação por card do Painel Hostess (aceitar/sentar/cancelar/notificar/tag). */
function AcaoHostessOverlays({
  acao,
  reserva,
  onClose,
  onSucesso,
  onPatchReserva,
}: {
  acao: AcaoCard
  reserva: ReservaPainel
  onClose: () => void
  onSucesso: (s: SucessoInfo) => void
  onPatchReserva: (patch: Partial<ReservaPainel>) => void
}) {
  if (acao === 'aceitar') {
    return (
      <AceitarSentar
        open
        reserva={reserva}
        aceitar
        onClose={onClose}
        onConfirmar={(mesa) => {
          onPatchReserva({ status: 'Confirmada', mesa: mesa.replace('Mesa ', ''), rsvp: false })
          onSucesso({
            titulo: 'Reserva aceita',
            texto: `${reserva.cliente} foi encaminhado para a mesa ${mesa}.`,
          })
        }}
      />
    )
  }

  if (acao === 'sentar') {
    return (
      <AceitarSentar
        open
        reserva={reserva}
        aceitar={false}
        onClose={onClose}
        onConfirmar={(mesa, obs) => {
          onPatchReserva({ status: 'Sentado', mesa: mesa.replace('Mesa ', ''), observacao: obs || undefined })
          onSucesso({
            titulo: 'Cliente sentado',
            texto: `${reserva.cliente} foi acomodado na mesa ${mesa}.`,
          })
        }}
      />
    )
  }

  if (acao === 'cancelar') {
    return (
      <CancelarReserva
        open
        reserva={reserva}
        onClose={onClose}
        onConfirmar={(motivo) => {
          onPatchReserva({ status: 'Cancelada' })
          onSucesso({
            titulo: 'Reserva cancelada',
            texto: `A reserva de ${reserva.cliente} foi cancelada (${motivo.toLowerCase()}).`,
          })
        }}
      />
    )
  }

  if (acao === 'notificar') {
    return (
      <NotificarCliente
        open
        reserva={reserva}
        onClose={onClose}
        onConfirmar={() => {
          onSucesso({
            titulo: 'Cliente notificado',
            texto: `Mensagem enviada para ${reserva.cliente}.`,
          })
        }}
      />
    )
  }

  if (acao === 'tag') {
    return (
      <AdicionarTagPainel
        open
        reserva={reserva}
        onClose={onClose}
        onConfirmar={(tag) => {
          onPatchReserva({ tag })
          onSucesso({
            titulo: 'Tag adicionada',
            texto: `Tag "${tag}" adicionada à reserva de ${reserva.cliente}.`,
          })
        }}
      />
    )
  }

  return null
}
