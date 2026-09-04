import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import './TagMeAccessPage.css'

/**
 * TagMeAccessPage – tela de acesso do portal TagMe (print "image (63)").
 *
 * É a tela que o botão "Prévia Tagme" da landing intermediária de reservas
 * abre (rota `/tagme`). Mostra a saudação do portal e a grade de aplicações
 * disponíveis ("Você será conectado automaticamente").
 *
 * Fluxo feliz (escopo combinado): só a aplicação **Reserva** tem tela neste
 * protótipo e é exibida; as demais (Lista de Espera, Passantes, Menu Digital,
 * Relatórios, Insights) ficam ocultas. O card Reserva navega para `/tagme/reservas`
 * (Painel do Reserva). O botão "Voltar" devolve à landing `/reservas/visao-geral`.
 *
 * Rota: `/tagme` (registrada no main.tsx, fora do ClientFrame – tela cheia).
 */
export default function TagMeAccessPage() {
  return (
    <div className="tagme-access">
      {/* Topo da página: logo + título do portal + usuário */}
      <header className="tagme-access__topbar">
        <Link to="/reservas/visao-geral" className="tagme-access__back" aria-label="Voltar para a página intermediária">
          <Icon name="back" style="Line" size={20} />
          <span>Voltar</span>
        </Link>

        <div className="tagme-access__brand">
          <span className="tagme-access__logo">tagme</span>
          <span className="tagme-access__portal-label">Portal de acesso</span>
        </div>

        <span className="tagme-access__user">Olá, Gabriela.</span>
      </header>

      {/* Conteúdo central: saudação + grade de aplicações */}
      <main className="tagme-access__main">
        <div className="tagme-access__welcome">
          <h1 className="tagme-access__title">Bem-vindo à Tagme</h1>
          <p className="tagme-access__subtitle">
            Escolha uma aplicação abaixo. Você será conectado automaticamente.
          </p>
        </div>

        <div className="tagme-access__apps">
          {/* Aplicação Reserva – única com tela no fluxo feliz (Painel) */}
          <Link to="/tagme/reservas" className="tagme-access__app-card">
            <div className="tagme-access__app-icon tagme-access__app-icon--reserva" aria-hidden="true">
              <Icon name="calendar" style="Line" size={28} />
            </div>
            <div className="tagme-access__app-info">
              <h2 className="tagme-access__app-name">Reserva</h2>
              <p className="tagme-access__app-cta">Acesse esta aplicação Tagme.</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="tagme-access__footer">
        tagme © 2026 Tagme. Todos os direitos reservados. Versão 1.0.0
      </footer>
    </div>
  )
}
