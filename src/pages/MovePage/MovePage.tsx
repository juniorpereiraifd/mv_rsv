import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon'
import BottomSheet from '../../components/BottomSheet/BottomSheet'
import { useCheckins } from '../../context/CheckinProvider'
import { useReservas } from '../../context/ReservaProvider'
import faixa1Url from '../../assets/move/faixa-1.svg'
import faixa2Url from '../../assets/move/faixa-2.svg'
import heroPhotoUrl from '../../../header_foto.png'
import deco1Url from '../../assets/move/deco-1.svg'
import deco2Url from '../../assets/move/deco-2.svg'
import deco3Url from '../../assets/move/deco-3.svg'
import logoMarkUrl from '../../assets/move/logo-mark.svg'
import logoWord1Url from '../../assets/move/logo-word-1.svg'
import logoWord2Url from '../../assets/move/logo-word-2.svg'
import './MovePage.css'

/**
 * MovePage – landing page de destino do botão "Voltar" da home (Figma 103:7956
 * "Header"). É o anúncio do "Comer Fora"/iFood Move: o hero vermelho ocupa a
 * página inteira (o design é um frame de 1306×640; a pedido do usuário virou
 * full-height responsivo – "pegar a tela inteira").
 *
 * Composição (mesmas coordenadas absolutas do design):
 *  1. Hero (103:7957): fundo vermelho #f91c4c (camada "Faixas" 103:7958 pinta
 *     por cima do #eb0033) com duas faixas em SVG ancoradas à borda direita –
 *     fora do canvas em 1306px, entram só em telas muito largas.
 *  2. Lockup do logo (103:7962) + título "Atraia e fidelize clientes com o
 *     iFood pra Comer Fora" e subtítulo, alinhados ao canto superior esquerdo.
 *  3. Ilustração do hero (103:7990) com os 3 decos em `mix-blend-multiply`,
 *     ancorada no canto superior direito.
 *  4. Cardlist "Explore nossas experiências" (103:7996), branco, colado na base
 *     com 4px de vermelho visível nas bordas (o design sobrepõe o card ao hero),
 *     com três cards navegáveis: "Visão do restaurante" (ícone order) → `/salao`,
 *     que embute o Portal B2B/CRM publicado em portal-nn.vercel.app; "Visão do
 *     cliente" (ícone user) → home do Comer Fora; e "Visão de reservas" (ícone
 *     calendar) → `/reservas`, que por enquanto embute o mesmo portal-nn (teste).
 *     Ambos usam a mesma mecânica: iframe full-screen com barra "Voltar" p/ /move.
 *
 * Desvios responsivos (documentados no CSS): a ilustração some abaixo de
 * 1280px (a composição texto-à-esquerda/imagem-à-direita só fecha com folga
 * nessa largura); os cards de experiência ficam SEMPRE lado a lado (pedido
 * explícito do usuário). A barra de status do iOS foi omitida (mesma decisão
 * do RestaurantHero/BeneficioPage).
 *
 * Rota: `/move` (registrada no main.tsx). O botão de voltar da home navega
 * até aqui via `<Link to="/move">` no BrandHeader.
 */
export default function MovePage() {
  // Reset da demonstração – único caminho para apagar os check-ins (com
  // confirmação). `feedback` mostra o resultado da operação por alguns segundos.
  const { reset } = useCheckins()
  // Reservas vivem só no localStorage (sem backend) – o reset também as limpa.
  const { reset: resetReservas } = useReservas()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState<'ok' | 'error' | null>(null)

  // Dismiss automático da mensagem de sucesso/erro após 4s.
  useEffect(() => {
    if (!feedback) return
    const id = window.setTimeout(() => setFeedback(null), 4000)
    return () => window.clearTimeout(id)
  }, [feedback])

  const handleReset = async () => {
    setConfirmOpen(false)
    const ok = await reset()
    // Reserva limpa em paralelo ao check-in: nada do local sobrevive ao reset.
    resetReservas()
    setFeedback(ok ? 'ok' : 'error')
  }

  return (
    <div className="move-page">
      {/* Hero de fundo (103:7957) – camada puramente decorativa */}
      <div className="move-hero" aria-hidden="true">
        <div className="move-hero__faixas">
          <img className="move-hero__faixa move-hero__faixa--1" src={faixa1Url} alt="" />
          <img className="move-hero__faixa move-hero__faixa--2" src={faixa2Url} alt="" />
        </div>
      </div>

      <div className="move-page__frame">
        {/* Ilustração do hero (103:7990) – decoração; oculta em telas < 1280px */}
        <div className="move-hero__image" aria-hidden="true">
          <img className="move-hero__deco move-hero__deco--1" src={deco1Url} alt="" />
          <img className="move-hero__deco move-hero__deco--2" src={deco2Url} alt="" />
          <img className="move-hero__deco move-hero__deco--3" src={deco3Url} alt="" />
          <img className="move-hero__photo" src={heroPhotoUrl} alt="" />
        </div>

        {/* Lockup do logo (103:7962) + texto (103:7978) */}
        <div className="move-hero__content">
          <div className="move-hero__logo" aria-hidden="true">
            <img className="move-hero__logo-mark" src={logoMarkUrl} alt="" />
            <img className="move-hero__logo-word move-hero__logo-word--1" src={logoWord1Url} alt="" />
            <img className="move-hero__logo-word move-hero__logo-word--2" src={logoWord2Url} alt="" />
          </div>

          <div className="move-hero__text">
            <h1 className="move-hero__title">
              Atraia e fidelize clientes
              <br />
              com o iFood pra Comer Fora
            </h1>
            <p className="move-hero__subtitle">
              Fidelize quem já vem ao salão e traga clientes do delivery para a
              sua vitrine com a força do iFood
            </p>
          </div>
        </div>

        {/* Cardlist "Explore nossas experiências" (103:7996) */}
        <div className="move-experiences">
          <div className="move-experiences__card">
            <div className="move-experiences__header">
              <h2 className="move-experiences__title">Explore nossas experiências</h2>
            </div>

            <div className="move-experiences__list">
              {/* "Visão do restaurante" leva à rota /salao, que embute o Portal
                  B2B (CRM do restaurante) publicado em portal-nn.vercel.app –
                  mesma mecânica da "Visão de reservas": iframe full-screen com
                  a barra "Voltar" para /move. */}
              <Link to="/salao" className="move-experience move-experience--link">
                <Icon name="order" style="Line" size={24} className="move-experience__icon" />
                <div className="move-experience__text">
                  <h3 className="move-experience__name">Visão do restaurante</h3>
                  <p className="move-experience__desc">
                    Crie ofertas no app, construa sua base de dados no check-in e
                    dispare mensagens para atrair e fidelizar clientes.
                  </p>
                </div>
              </Link>

              {/* "Visão do cliente" leva à home do Comer Fora (pedido do usuário) */}
              <Link to="/" className="move-experience move-experience--link">
                <Icon name="user" style="Line" size={24} className="move-experience__icon" />
                <div className="move-experience__text">
                  <h3 className="move-experience__name">Visão do cliente</h3>
                  <p className="move-experience__desc">
                    Veja como é fácil para nossos usuários encontrarem sua loja,
                    fazerem o check-in na mesa e resgatarem benefícios. Simule a jornada.
                  </p>
                </div>
              </Link>

              {/* "Visão de reservas" navega (mesma aba) para a página /reservas,
                  que embute o portal de reservas externo (portal-nn.vercel.app)
                  em iframe full-screen com a barra "Voltar" para /move – mesma
                  mecânica do card "Visão do restaurante" (/salao). */}
              <Link to="/reservas" className="move-experience move-experience--link">
                <Icon name="calendar" style="Line" size={24} className="move-experience__icon" />
                <div className="move-experience__text">
                  <h3 className="move-experience__name">Visão de reservas</h3>
                  <p className="move-experience__desc">
                    Acompanhe a ocupação por turno e prepare o salão: saiba quem
                    confirmou, quem não apareceu e quem você quer receber de novo.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Reset da demonstração – roda em baixo da cardlist, discreto. Só este
            botão apaga os check-ins e as reservas; nada automático limpa os
            dados. */}
        <footer className="move-reset">
          <button
            type="button"
            className="move-reset__button"
            onClick={() => {
              setFeedback(null)
              setConfirmOpen(true)
            }}
          >
            <Icon name="route" style="Line" size={16} />
            Redefinir demonstração
          </button>
          {feedback === 'ok' && (
            <p className="move-reset__feedback" role="status">
              Check-ins e reservas redefinidos.
            </p>
          )}
          {feedback === 'error' && (
            <p className="move-reset__feedback move-reset__feedback--error" role="alert">
              Não foi possível redefinir. Tente novamente.
            </p>
          )}
        </footer>
      </div>

      {/* Confirmação – bottom sheet no padrão do app (mesmo componente das
          regras do benefício). Ação destrutiva exige confirmação explícita. */}
      <BottomSheet open={confirmOpen} onClose={() => setConfirmOpen(false)} label="Redefinir demonstração">
        <div className="reset-sheet">
          <h2 className="reset-sheet__title">Redefinir demonstração?</h2>
          <p className="reset-sheet__desc">
            Todos os check-ins das lojas e as reservas confirmadas serão apagados. Essa ação não pode ser desfeita.
          </p>
          <div className="reset-sheet__actions">
            <button
              type="button"
              className="reset-sheet__button reset-sheet__button--ghost"
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="reset-sheet__button reset-sheet__button--danger"
              onClick={() => {
                void handleReset()
              }}
            >
              Redefinir
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
