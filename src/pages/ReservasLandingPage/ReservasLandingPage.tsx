import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import logoMarkUrl from '../../assets/move/logo-mark.svg'
import logoWord1Url from '../../assets/move/logo-word-1.svg'
import logoWord2Url from '../../assets/move/logo-word-2.svg'
import getinLogoUrl from '../../assets/move/getin-logo.svg'
import tagmeLogoUrl from '../../assets/move/tagme-logo.svg'
import './ReservasLandingPage.css'

/**
 * ReservasLandingPage – página intermediária antes do Portal de Reservas.
 *
 * É a tela que o card "Visão de reservas" do MovePage abre agora (Figma
 * 154:6185 "Header"): em vez de ir direto ao iframe de `/reservas`, o usuário
 * passa por esta landing que apresenta a ferramenta. Os CTAs "Prévia Get In"
 * e "Prévia Tagme" levam às prévias: "Get In" abre o portal externo embutido
 * (`/reservas`, iframe) e "Tagme" abre o fluxo próprio do TagMe (`/tagme`).
 *
 * Composição (espelha a `/move`, reaproveitando a mesma linguagem visual e os
 * mesmos assets – só com hero centralizado e cardlist "Como funciona"):
 *  1. Hero vermelho #f91c4c full-height com o lockup iFood Move + título
 *     "A experiência do seu cliente começa antes de ele chegar." + subtítulo +
 *     dois CTAs brancos "Prévia Get In" (→ `/reservas`) e "Prévia Tagme"
 *     (→ `/tagme`).
 *  2. Cardlist branca "Como funciona" colada na base com 3 cards de benefício:
 *     "Gestão de reservas" (calendar), "Gestão de filas" (clock) e "Cardápio
 *     Digital" (order).
 *
 * O ícone de cada card usa a mesma fonte de glifos da marca (família Line) e o
 * CTA tem o mesmo tratamento visual dos cards de experiência da `/move`
 * (pill branco com sombra no hover) – sem criar um design system novo.
 *
 * Rota: `/reservas/visao-geral` (registrada no main.tsx). O card "Visão de
 * reservas" do MovePage navega para cá.
 */
export default function ReservasLandingPage() {
  return (
    <div className="reservas-landing">
      <div className="reservas-landing__hero" aria-hidden="true">
        <div className="reservas-landing__faixas" />
      </div>

      <div className="reservas-landing__frame">
        {/* Voltar para o /move – a landing é aberta pelo card "Visão de
            reservas" da MovePage; este controle devolve o usuário a ela. */}
        <Link to="/move" className="reservas-landing__back">
          <Icon name="back" style="Line" size={20} className="reservas-landing__back-icon" />
          <span className="reservas-landing__back-label">Voltar</span>
        </Link>

        {/* Conteúdo centralizado do hero (154:6190) */}
        <div className="reservas-landing__hero-content">
          {/* Fileira de marcas (154:6342) – o lockup iFood Move acompanhado das
              logos das ferramentas apresentadas (Get In e TagMe), lado a lado
              com o mesmo gap de 36px do design. */}
          <div className="reservas-landing__brands" aria-hidden="true">
            <div className="reservas-landing__logo">
              <img className="reservas-landing__logo-mark" src={logoMarkUrl} alt="" />
              <img className="reservas-landing__logo-word reservas-landing__logo-word--1" src={logoWord1Url} alt="" />
              <img className="reservas-landing__logo-word reservas-landing__logo-word--2" src={logoWord2Url} alt="" />
            </div>
            <img className="reservas-landing__brand-img reservas-landing__brand-img--getin" src={getinLogoUrl} alt="" />
            <img className="reservas-landing__brand-img reservas-landing__brand-img--tagme" src={tagmeLogoUrl} alt="" />
          </div>

          <div className="reservas-landing__text">
            <h1 className="reservas-landing__title">
              A experiência do seu cliente começa antes de ele chegar.
            </h1>
            <p className="reservas-landing__subtitle">
              Não perca oportunidades de venda. Integre reservas, filas e cardápio ao
              maior canal de clientes do Brasil e eleve o padrão da sua gestão.
            </p>
          </div>

          {/* CTAs de prévia – "Get In" abre o portal externo embutido (/reservas,
              iframe); "Tagme" abre o fluxo próprio do TagMe (tela de acesso
              /tagme → Painel do Reserva). */}
          <div className="reservas-landing__cta-group">
            <Link to="/reservas" className="reservas-landing__cta">
              Prévia Get In
            </Link>
            <Link to="/tagme" className="reservas-landing__cta">
              Prévia Tagme
            </Link>
          </div>
        </div>

        {/* Cardlist "Como funciona" (154:6224/6225). A moldura externa
            (.reservas-landing__cardlist) é transparente com padding só embaixo
            (4px) – deixa a faixa vermelha do hero visível nas bordas; o painel
            branco (.reservas-landing__panel) tem o raio de 24px completo
            (154:6225 rounded-[24px]), igual ao card de experiências da /move. */}
        <div className="reservas-landing__cardlist">
          <div className="reservas-landing__panel">
            <div className="reservas-landing__cardlist-header">
              <h2 className="reservas-landing__cardlist-title">Como funciona</h2>
            </div>

            <div className="reservas-landing__cards">
              <div className="reservas-landing__card">
                <Icon name="calendar" style="Line" size={24} className="reservas-landing__card-icon" />
                <div className="reservas-landing__card-text">
                  <h3 className="reservas-landing__card-name">Gestão de reservas</h3>
                  <p className="reservas-landing__card-desc">
                    Garanta sua casa cheia com lembretes automáticos e tenha previsibilidade real.
                  </p>
                </div>
              </div>

              <div className="reservas-landing__card">
                <Icon name="clock" style="Line" size={24} className="reservas-landing__card-icon" />
                <div className="reservas-landing__card-text">
                  <h3 className="reservas-landing__card-name">Gestão de filas</h3>
                  <p className="reservas-landing__card-desc">
                    Processo inteligente de fila que evita que clientes desistam de viver a experiência da sua casa.
                  </p>
                </div>
              </div>

              <div className="reservas-landing__card">
                <Icon name="order" style="Line" size={24} className="reservas-landing__card-icon" />
                <div className="reservas-landing__card-text">
                  <h3 className="reservas-landing__card-name">Cardápio Digital</h3>
                  <p className="reservas-landing__card-desc">
                    Facilite a decisão de compra com seu cardápio sempre atualizado no Google, Maps e Instagram com um clique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
