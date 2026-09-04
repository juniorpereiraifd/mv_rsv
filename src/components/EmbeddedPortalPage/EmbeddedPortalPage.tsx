import { Link } from 'react-router-dom'
import Icon from '../Icon/Icon'
import './EmbeddedPortalPage.css'

/**
 * EmbeddedPortalPage – shell de página inteira para embutir um app externo
 * (Portal B2B em `/salao`, Portal de Reservas em `/reservas`) num iframe
 * full-screen. O B2C mantém a barra de navegação no topo (discreta, com
 * "Voltar" para a página de perfil `/move`) e o conteúdo abaixo é 100% do app
 * parceiro – assim o clique no card do MovePage não "sai" do demo e o usuário
 * volta com um toque.
 */
interface EmbeddedPortalPageProps {
  /** URL do app a embutir no iframe (SPA parceira que controla a própria altura). */
  src: string
  /** Título exibido na barra (ex.: "Visão do restaurante"). */
  title: string
}

export default function EmbeddedPortalPage({ src, title }: EmbeddedPortalPageProps) {
  return (
    <div className="portal-experience">
      <header className="portal-experience__toolbar">
        <Link to="/move" className="portal-experience__back">
          <Icon name="back" style="Line" size={20} />
          <span className="portal-experience__back-label">Voltar</span>
        </Link>
        <h1 className="portal-experience__title">{title}</h1>
      </header>

      <iframe className="portal-experience__frame" src={src} title={title} />
    </div>
  )
}
