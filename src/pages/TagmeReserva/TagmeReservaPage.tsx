import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import './TagmeReservaPage.css'

/**
 * TagmeReservaPage – Painel do app "Reserva" do portal TagMe (print "image (64)").
 *
 * Tela cheia (rota `/tagme/reservas`), alcançada pelo card "Reserva" da tela de
 * acesso do TagMe. Replica o layout do Painel do print: barra superior com o
 * seletor de loja e ações rápidas, busca/filtros, coluna de reservas (cards) e
 * painel lateral de ocupação do salão. A sidebar escura traz os grupos de menu
 * do portal; neste fluxo feliz apenas o "Painel" é navegável (está ativo) e os
 * demais itens ficam sem ação (não há telas implementadas para eles).
 *
 * Botão "Voltar" no topo → tela de acesso do TagMe (`/tagme`). Elementos cujo
 * fluxo não está nos prints (Nova reserva, Escanear QR, etc.) ficam estáticos,
 * reproduzindo o visual sem inventar navegação.
 */
export default function TagmeReservaPage() {
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
          {/* Demais grupos – sem tela no fluxo feliz, renderizados como itens
              inertes (o print mostra o menu completo). */}
          <span className="tagme-reserva__nav-item">
            <Icon name="calendar" style="Line" size={18} />
            Reservas
          </span>
          <span className="tagme-reserva__nav-item">
            <Icon name="clock" style="Line" size={18} />
            Passantes
          </span>
          <span className="tagme-reserva__nav-item">
            <Icon name="route" style="Line" size={18} />
            Comunicações
          </span>

          <div className="tagme-reserva__nav-group">
            <span className="tagme-reserva__nav-item">
              <Icon name="user" style="Line" size={18} />
              Operações
            </span>
            <span className="tagme-reserva__nav-item">
              <Icon name="location" style="Line" size={18} />
              Identidade e acesso
            </span>
            <span className="tagme-reserva__nav-item">
              <Icon name="pin" style="Line" size={18} />
              Venues e espaços
            </span>
            <span className="tagme-reserva__nav-item">
              <Icon name="star" style="Line" size={18} />
              Plataforma
            </span>
            <span className="tagme-reserva__nav-item">
              <Icon name="loyalty" style="Line" size={18} />
              Configuração
            </span>
          </div>
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
            <button type="button" className="tagme-reserva__btn tagme-reserva__btn--primary">
              + Nova reserva
            </button>
            <button type="button" className="tagme-reserva__btn">
              Escanear QR
            </button>
            <button type="button" className="tagme-reserva__btn">
              Passantes
            </button>
            <button type="button" className="tagme-reserva__btn">
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Busca e filtros */}
        <div className="tagme-reserva__filters">
          <div className="tagme-reserva__search">
            <Icon name="search" style="Line" size={16} />
            <span>Buscar cliente</span>
          </div>
          <div className="tagme-reserva__filter">Todos ▾</div>
          <div className="tagme-reserva__filter">Pendentes</div>
          <div className="tagme-reserva__filter">Em aberto</div>
          <div className="tagme-reserva__filter tagme-reserva__filter--muted">Todos os status ▾</div>
          <div className="tagme-reserva__filter tagme-reserva__filter--muted">Origem ▾</div>
          <div className="tagme-reserva__filter tagme-reserva__filter--muted">Salão ▾</div>
          <div className="tagme-reserva__filter tagme-reserva__filter--muted">Pessoas ▾</div>
          <div className="tagme-reserva__filter tagme-reserva__filter--muted">Horário · pessoas ▾</div>
        </div>

        {/* Corpo: coluna de reservas + painel lateral */}
        <div className="tagme-reserva__body">
          {/* Coluna de reservas */}
          <section className="tagme-reserva__reservas">
            <h2 className="tagme-reserva__section-title">Reservas</h2>

            {/* Card de reserva – Casamento */}
            <article className="tagme-reserva__card">
              <div className="tagme-reserva__card-head">
                <span className="tagme-reserva__badge tagme-reserva__badge--confirmado">CONFIRMADO</span>
                <span className="tagme-reserva__card-name">Casamento Julyana E Silvson</span>
                <span className="tagme-reserva__card-event">EVENTO RECEPÇÃO DE CASAMENTO</span>
                <button type="button" className="tagme-reserva__card-close" aria-label="Fechar">
                  <Icon name="close" size={14} />
                </button>
              </div>
              <div className="tagme-reserva__card-tags">
                <span className="tagme-reserva__chip tagme-reserva__chip--rsvp">RSVP</span>
                <span className="tagme-reserva__chip">WhatsApp</span>
                <span className="tagme-reserva__chip">Salão Principal</span>
              </div>
              <div className="tagme-reserva__card-row">
                <span className="tagme-reserva__card-time">12:00</span>
                <span className="tagme-reserva__card-pax">26 pessoas</span>
              </div>
              <div className="tagme-reserva__card-contact">
                <span className="tagme-reserva__contact-name">Rodrigo Lima Lima</span>
                <span className="tagme-reserva__contact-code">CBA4H2726</span>
              </div>
            </article>

            {/* Card de reserva – Reserva online */}
            <article className="tagme-reserva__card">
              <div className="tagme-reserva__card-head">
                <span className="tagme-reserva__badge tagme-reserva__badge--novo">NOVO</span>
                <span className="tagme-reserva__card-name">Rodrigo Lima Lima</span>
                <span className="tagme-reserva__card-code">CBA4H2726</span>
                <button type="button" className="tagme-reserva__card-close" aria-label="Fechar">
                  <Icon name="close" size={14} />
                </button>
              </div>
              <div className="tagme-reserva__card-tags">
                <span className="tagme-reserva__chip">Reserva online</span>
                <span className="tagme-reserva__chip">Salão Principal</span>
                <button type="button" className="tagme-reserva__add-tag">+ Adicionar tag</button>
              </div>
              <div className="tagme-reserva__card-row">
                <span className="tagme-reserva__card-time">17:00</span>
                <span className="tagme-reserva__card-pax">6 pessoas</span>
              </div>
              <div className="tagme-reserva__card-contact">
                <span className="tagme-reserva__contact-name">Paula Amaral</span>
                <span className="tagme-reserva__contact-code">CBAA9076E</span>
                <span className="tagme-reserva__contact-note">att. Valéria</span>
              </div>
            </article>
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
      </div>
    </div>
  )
}
