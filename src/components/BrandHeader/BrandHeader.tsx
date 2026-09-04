import { Link } from 'react-router-dom'
import logocfUrl from './logocf.png'
import Icon from '../Icon/Icon'
import './BrandHeader.css'

/**
 * BrandHeader – bloco vermelho da marca com o toolbar de busca colado ao topo
 * (design 64:2633 "Wrap"). O toolbar sobrepõe a header via posicionamento
 * absoluto: botão de voltar à esquerda, pílula de busca (texto + presente) e
 * botão de perfil com selo verde "Info Merchant" à direita.
 *
 * Abaixo do toolbar fica a promoção (design 66:2662 "Frame 2147205304"),
 * alinhada à esquerda: a tagline "Descontos e reserva de mesa em um só lugar"
 * e o lockup da marca (logo logocf.png).
 */
interface BrandHeaderProps {
  /** Abre o overlay "Buscar em" montado pela home (App/BuscarSheet, Figma
   * 139:3692). A pílula de busca era um `<Link to="/buscar">` – rota removida;
   * virou ação local da home (decisão do usuário). */
  onOpenBuscar: () => void
}

export default function BrandHeader({ onOpenBuscar }: BrandHeaderProps) {
  return (
    <header className="brand-header">
      <div className="brand-header__toolbar">
        <Link to="/move" className="brand-header__toolbar-btn" aria-label="Voltar">
          <Icon name="back" size={24} style="Line" />
        </Link>

        <div className="brand-header__toolbar-search">
          {/* Pílula "Buscar em" (design 64:2637) – é um `<button>`: tocar abre o
              overlay de busca SOBRE a home (App/BuscarSheet, Figma 139:3692),
              em vez de navegar para a antiga rota `/buscar` (removida). O rótulo
              "Cambuí, Campinas" é o endereço fixo do design (não há
              geolocalização real). O botão de presente ao lado (gift) continua
              morto – fora do escopo desta mudança. */}
          <button
            type="button"
            className="brand-header__toolbar-search-text"
            aria-label="Buscar em Cambuí, Campinas"
            onClick={onOpenBuscar}
          >
            <span className="brand-header__toolbar-search-title">
              <span className="brand-header__toolbar-search-title-muted">Buscar em </span>
              Cambuí, Campinas
            </span>
          </button>
          <button type="button" className="brand-header__toolbar-action" aria-label="Buscar">
            <Icon name="search" size={20} style="Line" />
          </button>
        </div>

        {/* Perfil (design 64:2651) – navega para a página de perfil do usuário
            (Figma 112:8338); antes era um `<button>` morto. */}
        <Link to="/perfil" className="brand-header__toolbar-btn" aria-label="Abrir perfil">
          <span className="brand-header__toolbar-badge" aria-hidden="true" />
          <Icon name="profile" size={20} />
        </Link>
      </div>

      {/* Promo (design 66:2662): tagline + lockup. A tagline é conteúdo real;
       * o lockup é decoração de marca (logo logocf.png). */}
      <div className="brand-header__promo">
        <p className="brand-header__promo-tagline">
          <span className="brand-header__promo-tagline-bold">
            Descontos e{' '}
            {/* Quebra tipográfica da 2ª linha: no celular/tablet este fragmento
                fica inline e o texto corre contínuo ("Descontos e reserva de
                mesa"); dentro do mockup de TV (html[data-mockup]) ele vira
                block e quebra em duas linhas fixas — ver BrandHeader.css. */}
            <span className="brand-header__promo-tagline-bold-break">
              reserva de mesa
            </span>
          </span>
          <span className="brand-header__promo-tagline-light">em um só lugar</span>
        </p>
        <p className="brand-header__promo-lockup" aria-hidden="true">
          <img className="brand-header__promo-lockup-logo" src={logocfUrl} alt="" />
        </p>
      </div>
    </header>
  )
}
